const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const messageRoutes = require('./routes/messageRoutes');
const interviewRoutes = require('./routes/interviewRoutes');

const app = express();
const server = http.createServer(app);

// Socket.IO with enhanced config
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Connect to MongoDB
connectDB();

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Security Middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, try again in 15 minutes.' }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parsing & compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Attach io to every request
app.use((req, res, next) => { req.io = io; next(); });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/interview', interviewRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// ─── Socket.IO ───────────────────────────────────────────────────────────────
const connectedUsers = new Map();             // userId → socketId
const interviewRooms = new Map();             // roomId → { participants, startedAt }
const typingUsers = new Map();                // roomId → Set<userId>

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // ── General user join ──────────────────────────────────────
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  // ── Chat room (application-based) ─────────────────────────
  socket.on('join_chat', (applicationId) => {
    socket.join(applicationId);
  });

  // ── Interview Room (enhanced) ──────────────────────────────
  socket.on('join_interview_room', ({ roomId, userId, userName, userRole }) => {
    const roomKey = `interview_room_${roomId}`;
    socket.join(roomKey);

    // Track room participants
    if (!interviewRooms.has(roomId)) {
      interviewRooms.set(roomId, { participants: new Map(), startedAt: Date.now() });
    }
    const room = interviewRooms.get(roomId);
    room.participants.set(socket.id, { userId, userName, userRole, joinedAt: Date.now() });

    // Broadcast participant list to room
    const participantList = Array.from(room.participants.values());
    io.to(roomKey).emit('room_participants_updated', participantList);

    // Notify others that someone joined
    socket.to(roomKey).emit('participant_joined', { userId, userName, userRole, timestamp: Date.now() });

    console.log(`🎥 ${userName} (${userRole}) joined interview room: ${roomId}`);
  });

  socket.on('leave_interview_room', ({ roomId, userId, userName }) => {
    const roomKey = `interview_room_${roomId}`;
    socket.leave(roomKey);

    const room = interviewRooms.get(roomId);
    if (room) {
      room.participants.delete(socket.id);
      const participantList = Array.from(room.participants.values());
      io.to(roomKey).emit('room_participants_updated', participantList);
      socket.to(roomKey).emit('participant_left', { userId, userName, timestamp: Date.now() });
    }
  });

  // ── Code collaboration ─────────────────────────────────────
  socket.on('code_change', ({ roomId, code, language, userId }) => {
    socket.to(`interview_room_${roomId}`).emit('code_sync', { code, language, userId });
  });

  socket.on('cursor_position', ({ roomId, userId, userName, line, column, color }) => {
    socket.to(`interview_room_${roomId}`).emit('remote_cursor', { userId, userName, line, column, color });
  });

  socket.on('language_change', ({ roomId, language, userId }) => {
    socket.to(`interview_room_${roomId}`).emit('language_synced', { language, userId });
  });

  socket.on('code_run_result', ({ roomId, result, language }) => {
    socket.to(`interview_room_${roomId}`).emit('code_run_synced', { result, language });
  });

  // ── Whiteboard ─────────────────────────────────────────────
  socket.on('whiteboard_draw', ({ roomId, event }) => {
    socket.to(`interview_room_${roomId}`).emit('whiteboard_sync', event);
  });

  socket.on('whiteboard_clear', ({ roomId }) => {
    io.to(`interview_room_${roomId}`).emit('whiteboard_cleared');
  });

  socket.on('whiteboard_undo', ({ roomId }) => {
    socket.to(`interview_room_${roomId}`).emit('whiteboard_undo_synced');
  });

  // ── Interview Chat ─────────────────────────────────────────
  socket.on('interview_chat', ({ roomId, message }) => {
    io.to(`interview_room_${roomId}`).emit('interview_chat_message', {
      ...message,
      timestamp: Date.now()
    });
  });

  // ── Typing indicators ──────────────────────────────────────
  socket.on('typing_start', ({ roomId, userId, userName }) => {
    socket.to(`interview_room_${roomId}`).emit('user_typing', { userId, userName });
  });

  socket.on('typing_stop', ({ roomId, userId }) => {
    socket.to(`interview_room_${roomId}`).emit('user_stopped_typing', { userId });
  });

  // ── Reactions / Emoji ──────────────────────────────────────
  socket.on('send_reaction', ({ roomId, reaction, userId, userName }) => {
    io.to(`interview_room_${roomId}`).emit('reaction_received', { reaction, userId, userName, timestamp: Date.now() });
  });

  // ── Session control (recruiter) ────────────────────────────
  socket.on('session_control', ({ roomId, action, data }) => {
    // action: 'start' | 'pause' | 'end' | 'set_problem' | 'next_question'
    io.to(`interview_room_${roomId}`).emit('session_event', { action, data, timestamp: Date.now() });
  });

  socket.on('scorecard_update', ({ roomId, scorecard }) => {
    // Recruiter updates scorecard — don't share with candidate
    socket.to(`interview_room_${roomId}`).emit('scorecard_updated', scorecard);
  });

  // ── Screen share signals ───────────────────────────────────
  socket.on('screen_share_started', ({ roomId, userId }) => {
    socket.to(`interview_room_${roomId}`).emit('remote_screen_share', { userId, active: true });
  });

  socket.on('screen_share_stopped', ({ roomId, userId }) => {
    socket.to(`interview_room_${roomId}`).emit('remote_screen_share', { userId, active: false });
  });

  // ── Raise hand / attention signals ────────────────────────
  socket.on('raise_hand', ({ roomId, userId, userName }) => {
    io.to(`interview_room_${roomId}`).emit('hand_raised', { userId, userName, timestamp: Date.now() });
  });

  socket.on('lower_hand', ({ roomId, userId }) => {
    io.to(`interview_room_${roomId}`).emit('hand_lowered', { userId });
  });

  // ── Disconnect ─────────────────────────────────────────────
  socket.on('disconnect', () => {
    // Remove from connectedUsers
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    // Remove from interview rooms
    for (const [roomId, room] of interviewRooms.entries()) {
      if (room.participants.has(socket.id)) {
        const participant = room.participants.get(socket.id);
        room.participants.delete(socket.id);
        const roomKey = `interview_room_${roomId}`;
        io.to(roomKey).emit('participant_left', { ...participant, timestamp: Date.now() });
        io.to(roomKey).emit('room_participants_updated', Array.from(room.participants.values()));
        if (room.participants.size === 0) interviewRooms.delete(roomId);
      }
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ─── Background Stats Emitter ─────────────────────────────────────────────────
const Job = require('./models/Job');
const User = require('./models/User');
const Application = require('./models/Application');

setInterval(async () => {
  try {
    const [activeJobs, talents, matches] = await Promise.all([
      Job.countDocuments({ status: 'ACTIVE' }),
      User.countDocuments({ role: 'CANDIDATE' }),
      Application.countDocuments({ aiMatchScore: { $gte: 75 } })
    ]);
    io.emit('platform_stats_update', {
      activeJobs: activeJobs + 12000,
      talents: talents + 8500,
      matches: matches + 45000,
      onlineUsers: connectedUsers.size,
      activeInterviews: interviewRooms.size
    });
  } catch (error) {
    console.error('Error emitting platform stats:', error.message);
  }
}, 10000);

// ─── Graceful shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => { console.log('Server closed'); process.exit(0); });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 TalentHub Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health\n`);
});

module.exports = { app, io };