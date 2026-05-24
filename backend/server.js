const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
const passport = require('passport');
const http = require('http');
const socketIO = require('socket.io');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');


const dns = require('dns');


dns.setServers(['1.1.1.1','8.8.8.8']);

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const universityRoutes = require('./routes/universityRoutes');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const visaRoutes = require('./routes/visaRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const studyProfileRoutes = require('./routes/studyProfileRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const databaseTimeoutHandler = require('./middleware/databaseTimeoutHandler');

// Import configs
const passportConfig = require('./config/passport');
const { initializeSocket } = require('./config/socket');
const cronJobs = require('./config/cronJobs');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

// Initialize Socket.io
initializeSocket(io);

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(xss());

// Passport middleware
app.use(passport.initialize());
passportConfig(passport);

// Static files
app.use('/uploads', express.static('uploads'));

// Apply rate limiting
app.use('/api', rateLimiter);

// Database timeout handler
app.use(databaseTimeoutHandler);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/visa', visaRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/monitoring', monitoringRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/study-profiles', studyProfileRoutes);

// Health check with database connectivity
app.get('/api/health', async (req, res) => {
  try {
    // Check database connectivity
    const dbOps = require('./utils/databaseOperations');
    await dbOps.execute(() => mongoose.connection.db.admin().ping(), 'Database Health Check', 10000);

    res.status(200).json({
      success: true,
      message: 'Server and database are running',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        name: mongoose.connection.name,
        host: mongoose.connection.host
      }
    });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({
      success: false,
      message: 'Database connection issue',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: error.message
      }
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB Atlas connected successfully');
  
  // Start cron jobs
  cronJobs.start();
  
  // Start server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Client URL: ${process.env.CLIENT_URL}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  console.log('⚠️  Continuing without MongoDB connection for development...');
  
  // Start server anyway for development
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (without MongoDB)`);
    console.log(`📱 Client URL: ${process.env.CLIENT_URL}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

module.exports = { app, io };