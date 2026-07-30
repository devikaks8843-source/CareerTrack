// Simple MongoDB connection helper using Mongoose.
// This module exports a function that connects to the database
// using the MONGO_URI environment variable, with an optional local fallback.
const dns = require('dns');
const mongoose = require('mongoose');

// Provide reliable DNS servers for SRV lookup (helps on some networks).
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  const atlasUri = process.env.MONGO_URI;
  const localUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/careertrack';

  if (atlasUri) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(atlasUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB connected to Atlas: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn('MongoDB Atlas connection failed:', error.message);
      console.warn('Attempting to fall back to local MongoDB...');
    }
  } else {
    console.warn('MONGO_URI is not set. Falling back to local MongoDB at', localUri);
  }

  try {
    const conn = await mongoose.connect(localUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected locally: ${conn.connection.host}`);
  } catch (error) {
    console.error('Local MongoDB connection error:', error.message);
    console.error('Make sure MongoDB is running locally or set a valid MONGO_URI in Server/.env.');
    process.exit(1);
  }
};

module.exports = connectDB;
