import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import testRoutes from './routes/testRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors()); // Allows your React frontend to communicate with this API
app.use(express.json()); // Allows the server to accept JSON data in the req.body

// Start connecting to MongoDB Atlas asynchronously
let databaseConnected = false;
connectDB().then((success) => {
  databaseConnected = Boolean(success);
});

// Basic test route
app.get('/', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1 || databaseConnected;
  res.json({
    service: 'EduAI API',
    status: 'running',
    database: isConnected ? 'connected' : 'connecting',
  });
});

app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1 || databaseConnected;
  res.status(isConnected ? 200 : 200).json({
    status: 'ok',
    database: isConnected ? 'connected' : 'connecting',
  });
});

app.use('/api/tests', testRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/students', studentRoutes);

// Define the Port
const PORT = process.env.PORT || process.env.BACKEND_PORT || 5001;

// Start the Server immediately
const server = app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;