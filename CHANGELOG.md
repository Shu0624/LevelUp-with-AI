# Changelog

All notable changes to the LevelUp platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [3.0.0] — 2026-04-05

### Added — Person 4: AI & Infrastructure
- **AI Interview Chat**: 4 new interview topics — System Design, SQL, React, Node.js (9 total domains)
- **Interview Session Tracking**: Sessions auto-saved to DB with topic, duration, and message count
- **Interview History Page**: `/interview/history` shows past sessions with stats dashboard
- **Resume Version History UI**: Previous resume uploads displayed with scores for tracking improvement
- **Job Description Matching**: Paste a target JD and compare resume keywords against it
- **Roadmap ↔ Resume Connection**: Roadmap page auto-fetches resume skills for personalized plans
- **Enhanced Error Handling**: Structured error codes for Mongoose, JWT, Multer, and duplicate key errors
- **Enhanced Service Worker**: Multi-strategy caching (Network-First, Stale-While-Revalidate, Cache-First)
- **`.env.example`**: Comprehensive env documentation with generation tips
- **Rate Limiting**: Auth routes protected with `express-rate-limit` (login: 10/15min, register: 5/hr)
- **Env Validation**: Server fails fast on missing `MONGO_URI` or `JWT_SECRET`
- **Vercel Deployment**: `vercel.json` configured for monorepo hosting

---

## [2.0.0] — 2026-04-04

### Added — Phase 3: Assessment & PWA
- College Assessment page (Assignments, Attendance, Announcements)
- Faculty dashboard with class-scoped management
- Analytics dashboard with NLP query engine
- PWA support with `manifest.json` and service worker
- Code splitting via `React.lazy` and `Suspense`

---

## [1.5.0] — 2026-04-04

### Added — Phase 2: Learning & Engagement
- Binaural Beats player with frequency selection
- Task checklist with daily persistence
- Learning Hub with 4 seed modules (Java, Python, GenAI, Logical Reasoning)
- Module detail pages with markdown rendering
- Quiz system with scoring and progress tracking
- Course group chat via Socket.io

---

## [1.0.0] — 2026-04-03

### Added — Phase 1: Core Platform
- User authentication (Register/Login with JWT and Zod validation)
- Role-based access control (Student, Faculty, HOD, Principal, Placement)
- Classroom code system (`DEPT-YEAR-SECTION`)
- Student dashboard with study timer (Stopwatch + Countdown)
- Daily streak tracking with celebration animations
- AI Resume Analyzer with ATS scoring (local heuristic engine)
- AI Mock Interview chat with voice mode (STT + TTS)
- Peer WebRTC video room with room codes
- AI Career Roadmap generator (3/6/12 month plans)
- Curriculum Activities page (10 MNC program cards)
- Student Benefits page (25+ items across 5 categories)
- Dark/Light theme support
- Responsive design with glassmorphism UI

### Infrastructure
- MERN stack (MongoDB, Express, React + Vite, Node.js)
- Socket.io for real-time features
- CRON jobs for analytics aggregation
- PDF parsing for resume analysis (`pdf-parse`)
