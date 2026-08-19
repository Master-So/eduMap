import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import testRoutes from './routes/testRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors()); // Allows your React frontend to communicate with this API
app.use(express.json()); // Allows the server to accept JSON data in the req.body

// Connect to MongoDB Atlas
connectDB();

// Basic test route
app.get('/', (req, res) => {
  res.send('EduAI API is running...');
});
app.use('/api/tests', testRoutes);
app.use('/api/submissions', submissionRoutes);

// Define the Port
const PORT = process.env.PORT || 5000;

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});