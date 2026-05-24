// Database timeout middleware
const dbOps = require('../utils/databaseOperations');

const handleDatabaseTimeouts = (req, res, next) => {
  // Override res.json to catch database timeout errors
  const originalJson = res.json;
  res.json = function(data) {
    // If the response is already being sent, don't modify
    if (res.headersSent) {
      return originalJson.call(this, data);
    }

    // Check if this is a database timeout response we already handled
    if (data && data.message && (
      data.message.includes('Database operation timed out') ||
      data.message.includes('buffering timed out')
    )) {
      return originalJson.call(this, data);
    }

    return originalJson.call(this, data);
  };

  next();
};

module.exports = handleDatabaseTimeouts;