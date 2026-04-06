import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Users } from 'lucide-react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const CourseChat = ({ slug }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const room = slug; // Use module slug as room name

  useEffect(() => {
    if (!open) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-course-chat', room);
    });

    socket.on('course-chat-history', (history) => {
      setMessages(history);
    });

    socket.on('course-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.emit('leave-course-chat', room);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [open, room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('course-message', {
      room,
      userId: user?._id,
      userName: user?.name || 'Anonymous',
      message: input.trim(),
    });
    setInput('');
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Toggle Button - Fixed */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 ${
          open
            ? 'bg-destructive text-destructive-foreground'
            : 'bg-primary text-primary-foreground shadow-primary/30'
        }`}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] h-[480px] glass-morphism rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-background/80 backdrop-blur-md px-5 py-4 border-b border-border/50 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Users size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-foreground truncate">Study Group</h3>
                <p className="text-[10px] text-muted-foreground">
                  {connected ? '🟢 Connected' : '⚪ Connecting...'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/30">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-xs py-8">
                  No messages yet. Start the conversation! 💬
                </div>
              )}
              {messages.map((msg, i) => {
                const isOwn = msg.userId === user?._id;
                return (
                  <div key={msg._id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 text-sm shadow-sm ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                        : 'bg-secondary/80 border border-border/50 text-foreground rounded-2xl rounded-tl-sm'
                    }`}>
                      {!isOwn && (
                        <div className="text-[10px] font-bold text-primary mb-1 opacity-80">
                          {msg.userName}
                        </div>
                      )}
                      <p className="leading-relaxed">{msg.message}</p>
                      <div className={`text-[9px] mt-1 ${isOwn ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-background/80 backdrop-blur-md border-t border-border/50">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message..."
                  className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className={`p-2.5 rounded-xl transition-all ${
                    input.trim()
                      ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CourseChat;
