import express, { Application } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import adminRoutes from './routes/admin.routes';
import vitalRoutes from './routes/vital.routes';
import { errorHandler, notFound } from './middleware/error';
import { setupWebSocket } from './websocket/socket';

// Load environment variables
dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = parseInt(process.env.PORT || '3001', 10);

// Setup WebSocket
setupWebSocket(io);

// Make io instance available throughout the app
app.set('io', io);

// Make io accessible in routes
app.set('io', io);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration - Allow all origins for testing
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'ViApp Backend API',
    version: '1.0.0',
  });
});

// Serve Admin Dashboard as homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin-dashboard.html'));
});

// Serve API Tester
app.get('/api-tester', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'api-tester.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vitals', vitalRoutes);

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'ViApp Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
      },
      student: {
        profile: 'GET /api/student/profile',
        updateProfile: 'PUT /api/student/profile',
        latestVitals: 'GET /api/student/vitals/latest',
        vitalsHistory: 'GET /api/student/vitals/history',
        alerts: 'GET /api/student/alerts',
        acknowledgeAlert: 'PUT /api/student/alerts/:alertId/acknowledge',
        notifications: 'PUT /api/student/notifications',
      },
      admin: {
        students: 'GET /api/admin/students',
        studentDetails: 'GET /api/admin/student/:id',
        createStudent: 'POST /api/admin/student/create',
        updateStudent: 'PUT /api/admin/student/:id',
        deactivateStudent: 'DELETE /api/admin/student/:id',
        alerts: 'GET /api/admin/alerts',
        acknowledgeAlert: 'PUT /api/admin/alerts/:alertId/acknowledge',
        resolveAlert: 'PUT /api/admin/alerts/:alertId/resolve',
        registerDevice: 'POST /api/admin/device/register',
        assignDevice: 'PUT /api/admin/device/:deviceId/assign',
        unassignDevice: 'PUT /api/admin/device/:deviceId/unassign',
        devices: 'GET /api/admin/devices',
      },
      vitals: {
        upload: 'POST /api/vitals/upload',
        bulkUpload: 'POST /api/vitals/bulk-upload',
      },
    },
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server - explicitly bind to 0.0.0.0 to listen on all interfaces
const server = httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 ViApp Backend Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api`);
  console.log(`🧪 API Tester: http://localhost:${PORT}/ or http://localhost:${PORT}/api-tester`);
  console.log(`🌐 Network: http://192.168.100.10:${PORT}/api`);
  console.log(`⚡ WebSocket: ws://192.168.100.10:${PORT}\n`);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});
