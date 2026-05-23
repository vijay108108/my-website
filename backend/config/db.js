const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        'MongoDB URI not found. Set MONGO_URI environment variable with your MongoDB Atlas connection string. ' +
        'Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority'
      );
    }

    console.log('🔄 Connecting to MongoDB...');

    // Connect with optimized options for MongoDB Atlas and Render deployment
    const connection = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 for better compatibility with Render
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      connectTimeoutMS: 10000,
    });

    console.log('✓ MongoDB connected successfully');
    console.log(`✓ Database: ${connection.connection.db.getName()}`);
    console.log(`✓ Host: ${connection.connection.host}`);

    return connection;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    
    // Provide helpful error messages based on error type
    if (error.message.includes('authentication failed')) {
      console.error('  → Check your MongoDB Atlas username and password');
      console.error('  → Ensure IP address is whitelisted in MongoDB Atlas Network Access');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('  → Cannot reach MongoDB server. Check connection string');
    } else if (error.message.includes('MONGO_URI')) {
      console.error('  → Please set MONGO_URI environment variable');
    }

    // Exit process after 5 seconds to allow logs to be flushed
    setTimeout(() => process.exit(1), 5000);
  }
};

module.exports = connectDB;
