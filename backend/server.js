import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// Connect to MongoDB Atlas
const databaseReady = await connectDB();

// Basic test route
app.get('/', (req, res) => {
  res.json({ service: 'EduAI API', status: 'running', database: databaseReady ? 'connected' : 'not_configured' });
});
app.get('/api/health', (req, res) => {
  res.status(databaseReady ? 200 : 503).json({ status: databaseReady ? 'ok' : 'degraded', database: databaseReady ? 'connected' : 'not_configured' });
});
app.use('/api/tests', testRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/students', studentRoutes);

// Define the Port
const PORT = process.env.PORT || process.env.BACKEND_PORT || 5001;

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});