import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'node:dns';
dotenv.config();

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI is not configured. Backend started without database access.');
    return false;
  }
  try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    return false;
  }
};

export default connectDB;
