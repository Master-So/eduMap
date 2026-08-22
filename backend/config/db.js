import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'node:dns';

// Ensure environment variables are loaded
dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('MONGO_URI is not configured. Backend started without database access.');
    return false;
  }

  try {
    // Try connecting with standard configuration
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (initialError) {
    // If DNS resolution fails on custom Windows networks, fallback to public DNS and retry once
    if (initialError.message && (initialError.message.includes('querySrv') || initialError.message.includes('ENOTFOUND'))) {
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected (via fallback DNS): ${conn.connection.host}`);
        return true;
      } catch (retryError) {
        console.error(`MongoDB connection failed: ${retryError.message}`);
        return false;
      }
    }

    console.error(`MongoDB connection failed: ${initialError.message}`);
    return false;
  }
};

export default connectDB;
