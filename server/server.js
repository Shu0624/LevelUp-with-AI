import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import resumeRoutes from './routes/resume.js';
import aiRoutes from './routes/ai.js';
import modulesRoutes from './routes/modules.js';
import activityRoutes from './routes/activity.js';
import chatRoutes from './routes/chat.js';
import assessmentRoutes from './routes/assessment.js';
import analyticsRoutes from './routes/analytics.js';
import interviewRoutes from './routes/interview.js';
import ChatMessage from './models/ChatMessage.js';
import { runAggregation } from './scripts/aggregateAnalytics.js';

dotenv.config();

// ---- Fail-fast environment validation ----
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`\n❌ FATAL: Missing required environment variables: ${missing.join(', ')}`);
  console.error('   Copy .env.example to .env and fill in the values.\n');
  process.exit(1);
}

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup for WebRTC signaling later
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Security headers
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check for monitoring (UptimeRobot, etc.)
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Socket.io logic for WebRTC
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    // Broadcast to others in room that a user joined
    socket.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });

  // Relay WebRTC signaling messages
  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', payload);
  });

  socket.on('ice-candidate', (incoming) => {
    io.to(incoming.target).emit('ice-candidate', incoming);
  });

  // =====================================================================
  // COURSE GROUP CHAT
  // =====================================================================
  socket.on('join-course-chat', async (room) => {
    socket.join(`chat:${room}`);
    // Send last 50 messages on join
    try {
      const history = await ChatMessage.find({ room })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      socket.emit('course-chat-history', history.reverse());
    } catch (e) {
      console.error('Chat history error:', e);
    }
  });

  socket.on('leave-course-chat', (room) => {
    socket.leave(`chat:${room}`);
  });

  socket.on('course-message', async (data) => {
    const { room, userId, userName, message } = data;
    if (!room || !message) return;
    try {
      const saved = await ChatMessage.create({ room, userId, userName, message });
      io.to(`chat:${room}`).emit('course-message', saved);
    } catch (e) {
      console.error('Chat save error:', e);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/interview', interviewRoutes);

// =====================================================================
// CRON JOBS — Analytics Aggregation
// =====================================================================
// Daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Running daily analytics aggregation...');
  try { await runAggregation('daily'); } catch (e) { console.error('[CRON] Daily aggregation failed:', e.message); }
});
// Weekly on Sunday at midnight
cron.schedule('0 0 * * 0', async () => {
  console.log('[CRON] Running weekly analytics aggregation...');
  try { await runAggregation('weekly'); } catch (e) { console.error('[CRON] Weekly aggregation failed:', e.message); }
});
// Monthly on the 1st at midnight
cron.schedule('0 0 1 * *', async () => {
  console.log('[CRON] Running monthly analytics aggregation...');
  try { await runAggregation('monthly'); } catch (e) { console.error('[CRON] Monthly aggregation failed:', e.message); }
});
console.log('[CRON] Analytics aggregation jobs scheduled');


// =====================================================================
// ENHANCED ERROR HANDLING MIDDLEWARE
// =====================================================================
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';

  // Log with context for easier debugging
  console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${statusCode} ${errorCode}`);
  console.error(`  Message: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: messages.join(', ') });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ code: 'DUPLICATE_KEY', message: `A record with this ${field} already exists.` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ code: 'INVALID_TOKEN', message: 'Invalid authentication token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ code: 'TOKEN_EXPIRED', message: 'Authentication token has expired.' });
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({ code: 'UPLOAD_ERROR', message: err.message });
  }

  res.status(statusCode).json({
    code: errorCode,
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// If we are NOT deploying on Vercel Serverless, listen dynamically
if (process.env.VERCEL !== '1') {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

// Export for Vercel Serverless
export default app;
