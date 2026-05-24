const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { statusCode: 404, message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = { statusCode: 400, message };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { statusCode: 400, message };
  }

  // Database timeout errors
  if (err.message && (
    err.message.includes('Database operation timed out') ||
    err.message.includes('timed out') ||
    err.message.includes('buffering timed out') ||
    err.message.includes('operation exceeded time limit') ||
    err.message.includes('connection timed out') ||
    err.message.includes('server selection timed out')
  )) {
    const message = 'Server is busy. Please try again.';
    error = { statusCode: 503, message };
  }

  // Mongoose connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoServerError') {
    const message = 'Database connection error. Please try again later.';
    error = { statusCode: 503, message };
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = { statusCode: 400, message: 'File size too large' };
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error = { statusCode: 400, message: 'Too many files' };
    } else {
      error = { statusCode: 400, message: err.message };
    }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;