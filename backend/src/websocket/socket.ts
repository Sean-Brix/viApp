import { Server as SocketIOServer, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: 'ADMIN' | 'STUDENT';
}

export function setupWebSocket(io: SocketIOServer) {
  console.log('⚡ Setting up WebSocket...');

  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = verify(token, JWT_SECRET) as any;
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ Client connected: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`);

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      console.log(`📍 User ${socket.userId} joined room: user:${socket.userId}`);
    }

    // Admin joins admin room to receive all vital signs updates
    if (socket.userRole === 'ADMIN') {
      socket.join('admin');
      console.log(`👑 Admin ${socket.userId} joined admin room`);
    }

    // Student joins student-specific room
    if (socket.userRole === 'STUDENT') {
      socket.join(`student:${socket.userId}`);
      console.log(`🎓 Student ${socket.userId} joined room: student:${socket.userId}`);
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`⚠️ Socket error for ${socket.id}:`, error);
    });
  });

  console.log('✅ WebSocket setup complete');
  return io;
}

// Helper function to emit vital signs update
export function emitVitalSignsUpdate(io: SocketIOServer, studentId: string, vitalSignsData: any) {
  const payload = {
    studentId,
    data: vitalSignsData,
    timestamp: new Date().toISOString()
  };

  console.log(`📡 ===== EMITTING VITAL SIGNS UPDATE =====`);
  console.log(`📡 Student ID: ${studentId}`);
  console.log(`📡 Payload:`, JSON.stringify(payload));
  console.log(`📡 Total connected sockets: ${io.sockets.sockets.size}`);
  console.log(`📡 Sockets in admin room:`, io.sockets.adapter.rooms.get('admin')?.size || 0);
  
  // Emit to specific student
  io.to(`student:${studentId}`).emit('vitalSigns:update', payload);

  // Emit to all admins
  io.to('admin').emit('vitalSigns:update', payload);

  console.log(`📡 Event emitted to admin room`);
  console.log(`📡 ========================================`);
}

// Helper function to emit alert
export function emitAlert(io: SocketIOServer, studentId: string, alertData: any) {
  // Emit to specific student
  io.to(`student:${studentId}`).emit('alert:new', {
    studentId,
    alert: alertData,
    timestamp: new Date().toISOString()
  });

  // Emit to all admins
  io.to('admin').emit('alert:new', {
    studentId,
    alert: alertData,
    timestamp: new Date().toISOString()
  });

  console.log(`🚨 Emitted alert for student ${studentId}`);
}
