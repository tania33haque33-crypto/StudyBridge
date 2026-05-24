const mongoose = require('mongoose');

// MongoDB Atlas connection with optimized settings
const connectDB = async (retries = 5) => {
  // Parse MongoDB URI to add optimal parameters if not already present
  let mongoURI = process.env.MONGODB_URI;

  // Ensure connection string has optimal parameters for Atlas
  if (mongoURI && !mongoURI.includes('retryWrites')) {
    const separator = mongoURI.includes('?') ? '&' : '?';
    mongoURI = `${mongoURI}${separator}retryWrites=true&w=majority&maxPoolSize=50&waitQueueTimeoutMS=10000`;
  }

  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(mongoURI, {
        // Timeout Settings - Optimized for MongoDB Atlas
        serverSelectionTimeoutMS: 60000, // Increased from 30000
        socketTimeoutMS: 120000, // Increased from 60000
        connectTimeoutMS: 60000, // Increased from 30000

        // Connection Pooling
        maxPoolSize: 50,
        minPoolSize: 10,
        maxIdleTimeMS: 60000,

        // Buffering and Queue Management - Re-enabled for reliability
        bufferCommands: true, // Re-enabled buffering
        bufferMaxEntries: 10, // Allow some buffering

        // Monitoring and Health Checks
        heartbeatFrequencyMS: 10000,

        // Atlas-specific settings
        authSource: 'admin',
        ssl: true,
        sslValidate: true,
        family: 4,

        // Advanced Settings
        compressors: ['snappy', 'zlib'],
        zlibCompressionLevel: 6,
      });

      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);
      console.log(`🔐 Auth Source: admin`);
      console.log(`⚙️  Connection Pool: min=${10} max=${50}`);

      // Connection Events
      mongoose.connection.on('connected', () => {
        console.log('🔗 Mongoose connected to MongoDB Atlas');
      });

      mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('🔌 Mongoose disconnected from MongoDB Atlas');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 Mongoose reconnected to MongoDB Atlas');
      });

      // Monitor connection pool events
      const db = mongoose.connection.getClient();
      db?.on?.('connectionPoolCreated', (event) => {
        console.log('📦 Connection pool created', event.connectionPoolOptions);
      });

      db?.on?.('connectionPoolClosed', () => {
        console.log('📦 Connection pool closed');
      });

      // Graceful Shutdown
      process.on('SIGINT', async () => {
        try {
          await mongoose.connection.close();
          console.log('👋 Mongoose connection closed gracefully');
          process.exit(0);
        } catch (err) {
          console.error('Error during graceful shutdown:', err);
          process.exit(1);
        }
      });

      return conn;
    } catch (error) {
      const attempt = i + 1;
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);

      // Log detailed error info for debugging
      if (error.name === 'MongoServerError') {
        console.error('📋 MongoDB Server Error:', error.errmsg);
      } else if (error.name === 'MongoAuthenticationError') {
        console.error('🔐 Authentication failed - check credentials in MONGODB_URI');
      } else if (error.name === 'MongoNetworkError') {
        console.error('🌐 Network error - check MongoDB Atlas IP whitelist');
      } else if (error.name === 'MongoParseError') {
        console.error('📝 Connection string format error');
      }

      if (attempt === retries) {
        console.error('💥 All connection attempts failed. Continuing without database connection...');
        console.warn('⚠️  Database operations will fail. Please check your MongoDB Atlas setup.');
        // Don't throw error, continue without database
        return null;
      }

      // Exponential backoff with jitter to prevent thundering herd
      const exponentialDelay = Math.pow(2, i) * 1000;
      const jitterDelay = Math.random() * 1000;
      const totalDelay = exponentialDelay + jitterDelay;

      console.log(`⏳ Retry in ${Math.round(totalDelay)}ms (attempt ${attempt + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }
};

module.exports = connectDB;