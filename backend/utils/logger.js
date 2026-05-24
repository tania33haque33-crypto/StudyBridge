const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

// Format log message
const formatMessage = (level, message, meta = {}) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    meta,
  });
};

// Write to log file
const writeToFile = (filename, message) => {
  const filePath = path.join(logsDir, filename);
  fs.appendFileSync(filePath, message + '\n');
};

// Logger class
class Logger {
  static error(message, meta = {}) {
    const logMessage = formatMessage(LogLevel.ERROR, message, meta);
    console.error(logMessage);
    writeToFile('error.log', logMessage);
  }

  static warn(message, meta = {}) {
    const logMessage = formatMessage(LogLevel.WARN, message, meta);
    console.warn(logMessage);
    writeToFile('combined.log', logMessage);
  }

  static info(message, meta = {}) {
    const logMessage = formatMessage(LogLevel.INFO, message, meta);
    console.log(logMessage);
    writeToFile('combined.log', logMessage);
  }

  static debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = formatMessage(LogLevel.DEBUG, message, meta);
      console.log(logMessage);
      writeToFile('debug.log', logMessage);
    }
  }

  static request(req, res, duration) {
    const logMessage = formatMessage(LogLevel.INFO, 'HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    writeToFile('access.log', logMessage);
  }
}

module.exports = Logger;