import { io } from 'socket.io-client';

export const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

let socketInstance = null;

export const getSocket = () => socketInstance;

export const initSocket = (options = {}) => {
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
  }

  socketInstance = io(SOCKET_BASE_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
    ...options,
  });

  socketInstance.on('connect', () => {
    console.log('⚡ Socket connected to port 5001 ID:', socketInstance.id);
  });

  socketInstance.on('connect_error', (error) => {
    console.warn('⚠️ Socket connection note:', error.message);
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const emitStudentJoined = (data) => {
  const socket = socketInstance || initSocket();
  if (socket) {
    socket.emit('student_joined', {
      name: data.name,
      testId: data.testId,
      timestamp: new Date().toISOString(),
    });
  }
};

export const emitStudentFinish = (data) => {
  const socket = socketInstance || initSocket();
  if (socket) {
    socket.emit('student_finish', {
      studentName: data.studentName,
      testId: data.testId,
      score: data.score,
      total: data.total,
      answers: data.answers,
      submittedAt: new Date().toISOString(),
    });
  }
};
