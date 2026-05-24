// Database operation wrapper with timeout and retry logic
const mongoose = require('mongoose');

class DatabaseOperations {
  constructor() {
    this.maxRetries = 5;
    this.baseTimeout = 60000; // Increased from 30000 to 60000
    this.maxTimeout = 120000; // Increased from 60000 to 120000

    // Circuit breaker state
    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: null,
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      failureThreshold: 15, // Increased from 10 to 15
      recoveryTimeout: 30000, // Increased from 10000 to 30000
      successCount: 0,
      minSuccessCount: 3 // Increased from 2 to 3
    };

    // Performance metrics
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      timeoutOperations: 0,
      averageResponseTime: 0,
      operationTimes: []
    };
  }

  // Generic execute wrapper for custom operations
  async execute(operation, operationName = 'Database Operation', customTimeout = null) {
    // Execute directly without custom timeout wrapper - let MongoDB handle timeouts
    try {
      const result = await operation();
      return result;
    } catch (error) {
      console.error(`❌ ${operationName} failed: ${error.message}`);
      throw error;
    }
  }

  // Execute database operation with direct MongoDB execution (no custom timeout)
  async executeWithTimeout(operation, operationName = 'Database Operation', customTimeout = null) {
    // Check circuit breaker
    if (this.circuitBreaker.state === 'OPEN') {
      if (Date.now() - this.circuitBreaker.lastFailureTime < this.circuitBreaker.recoveryTimeout) {
        throw new Error('Circuit breaker is OPEN - database operations temporarily disabled');
      } else {
        this.circuitBreaker.state = 'HALF_OPEN';
        console.log('🔄 Circuit breaker transitioning to HALF_OPEN');
      }
    }

    // Execute directly without Promise.race timeout - let MongoDB's built-in timeouts work
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();

      // Retry on connection errors
      if (this.isRetryableError(error) && this.circuitBreaker.failures < this.circuitBreaker.failureThreshold) {
        const delay = Math.min(2000 * this.circuitBreaker.failures, 10000);
        console.log(`⏳ Retrying ${operationName} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithTimeout(operation, operationName, customTimeout);
      }

      throw error;
    }
  }

  // Circuit breaker success handler
  onSuccess() {
    this.circuitBreaker.failures = 0;

    if (this.circuitBreaker.state === 'HALF_OPEN') {
      this.circuitBreaker.successCount++;
      if (this.circuitBreaker.successCount >= this.circuitBreaker.minSuccessCount) {
        this.circuitBreaker.state = 'CLOSED';
        this.circuitBreaker.successCount = 0;
        console.log('✅ Circuit breaker CLOSED - database operations restored');
      }
    }
  }

  // Circuit breaker failure handler
  onFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();

    if (this.circuitBreaker.failures >= this.circuitBreaker.failureThreshold) {
      this.circuitBreaker.state = 'OPEN';
      console.log('🚫 Circuit breaker OPEN - database operations disabled');
    }
  }

  // Get circuit breaker status
  getCircuitBreakerStatus() {
    return {
      state: this.circuitBreaker.state,
      failures: this.circuitBreaker.failures,
      lastFailureTime: this.circuitBreaker.lastFailureTime,
      successCount: this.circuitBreaker.successCount
    };
  }

  // Reset circuit breaker
  resetCircuitBreaker() {
    this.circuitBreaker.state = 'CLOSED';
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.lastFailureTime = null;
    this.circuitBreaker.successCount = 0;
    console.log('✅ Circuit breaker reset');
  }

  // Check if error is retryable
  isRetryableError(error) {
    const retryableCodes = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNRESET',
      'EPIPE',
      50, // MongoDB operation exceeded time limit
      6,  // MongoDB host unreachable
      7,  // MongoDB host not found
      89, // MongoDB network timeout
      9001, // MongoDB socket exception
    ];

    const retryableMessages = [
      'operation exceeded time limit',
      'buffering timed out',
      'connection timed out',
      'socket hang up',
      'connection reset',
      'network timeout',
      'server selection timed out',
    ];

    return retryableCodes.includes(error.code) ||
           retryableMessages.some(msg => error.message?.toLowerCase().includes(msg.toLowerCase()));
  }

  // Wrapper for User.findOne operations
  async findUser(query, options = {}) {
    return this.execute(async () => {
      return await mongoose.model('User').findOne(query).setOptions(options);
    }, 'User.findOne');
  }

  // Wrapper for User.create operations
  async createUser(data) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('User').create(data);
    }, 'User.create');
  }

  // Wrapper for User.findOneAndUpdate operations
  async updateUser(query, update, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('User').findOneAndUpdate(query, update, {
        ...options,
        maxTimeMS: 60000 // Increased from 30000
      });
    }, 'User.findOneAndUpdate');
  }

  // Wrapper for User.findByIdAndDelete operations
  async deleteUser(query, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('User').findByIdAndDelete(query, options);
    }, 'User.findByIdAndDelete');
  }

  // Wrapper for Application.findOne operations
  async findApplication(query, options = {}, timeout = null) {
    return this.executeWithTimeout(async () => {
      let operation = mongoose.model('Application').findOne(query).maxTimeMS(10000);
      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(pop => {
            if (typeof pop === 'string') {
              operation = operation.populate(pop);
            } else if (typeof pop === 'object') {
              operation = operation.populate(pop.path, pop.select);
            }
          });
        } else {
          operation = operation.populate(options.populate);
        }
      }
      if (options.select) operation = operation.select(options.select);
      return await operation;
    }, 'Application.findOne', timeout);
  }

  // Wrapper for Application.find operations
  async findApplications(query, options = {}) {
    return this.executeWithTimeout(async () => {
      let operation = mongoose.model('Application').find(query).maxTimeMS(10000);
      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(pop => {
            if (typeof pop === 'string') {
              operation = operation.populate(pop);
            } else if (typeof pop === 'object') {
              operation = operation.populate(pop.path, pop.select);
            }
          });
        } else {
          operation = operation.populate(options.populate);
        }
      }
      if (options.skip !== undefined) operation = operation.skip(options.skip);
      if (options.limit !== undefined) operation = operation.limit(options.limit);
      if (options.sort) operation = operation.sort(options.sort);
      return await operation;
    }, 'Application.find');
  }

  // Wrapper for Application.create operations
  async createApplication(data) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Application').create(data);
    }, 'Application.create');
  }

  // Wrapper for Application.findOneAndUpdate operations
  async updateApplication(query, update, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Application').findOneAndUpdate(query, update, {
        ...options,
        maxTimeMS: 30000
      });
    }, 'Application.findOneAndUpdate');
  }

  // Wrapper for Application.findOneAndDelete operations
  async deleteApplication(query, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Application').findOneAndDelete(query, options);
    }, 'Application.findOneAndDelete');
  }

  // Wrapper for Application.countDocuments operations
  async countApplications(query) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Application').countDocuments(query).maxTimeMS(10000);
    }, 'Application.countDocuments');
  }

  // Wrapper for University.findById operations
  async findUniversityById(id, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('University').findById(id).maxTimeMS(10000).setOptions(options);
    }, 'University.findById');
  }

  // Wrapper for University.find operations
  async findUniversities(query, options = {}, timeout = null) {
    return this.executeWithTimeout(async () => {
      let operation = mongoose.model('University').find(query).maxTimeMS(10000);
      if (options.populate) {
        options.populate.forEach(pop => operation = operation.populate(pop));
      }
      if (options.skip) operation = operation.skip(options.skip);
      if (options.limit) operation = operation.limit(options.limit);
      if (options.sort) operation = operation.sort(options.sort);
      return await operation;
    }, 'University.find', timeout);
  }

  // Wrapper for University.findOneAndUpdate operations
  async updateUniversity(query, update, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('University').findOneAndUpdate(query, update, {
        ...options,
        maxTimeMS: 30000
      });
    }, 'University.findOneAndUpdate');
  }

  // Wrapper for Notification.create operations
  async createNotification(data) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Notification').create(data);
    }, 'Notification.create');
  }

  // Wrapper for Scholarship.find operations
  async findScholarships(query, options = {}, timeout = null) {
    return this.executeWithTimeout(async () => {
      let operation = mongoose.model('Scholarship').find(query).maxTimeMS(10000);
      if (options.skip !== undefined) operation = operation.skip(options.skip);
      if (options.limit !== undefined) operation = operation.limit(options.limit);
      if (options.sort) operation = operation.sort(options.sort);
      return await operation;
    }, 'Scholarship.find', timeout);
  }

  // Record successful operation metrics
  recordSuccess(startTime) {
    const responseTime = Date.now() - startTime;
    this.metrics.successfulOperations++;
    this.metrics.operationTimes.push(responseTime);

    // Keep only last 100 operations for average calculation
    if (this.metrics.operationTimes.length > 100) {
      this.metrics.operationTimes.shift();
    }

    // Calculate running average
    this.metrics.averageResponseTime =
      this.metrics.operationTimes.reduce((a, b) => a + b, 0) /
      this.metrics.operationTimes.length;
  }

  // Get performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalOperations > 0
        ? ((this.metrics.successfulOperations / this.metrics.totalOperations) * 100).toFixed(2) + '%'
        : 'N/A',
      timeoutRate: this.metrics.totalOperations > 0
        ? ((this.metrics.timeoutOperations / this.metrics.totalOperations) * 100).toFixed(2) + '%'
        : 'N/A',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  // Check MongoDB Atlas connection health
  async checkConnectionHealth() {
    try {
      const db = mongoose.connection.getClient();
      const adminDb = db.db('admin');
      const pingResult = await adminDb.admin().ping();

      return {
        status: 'healthy',
        response: pingResult,
        host: mongoose.connection.host,
        database: mongoose.connection.name,
        readyState: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
        connectionState: this.getConnectionState(mongoose.connection.readyState),
        circuitBreaker: this.getCircuitBreakerStatus(),
        metrics: this.getMetrics(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        host: mongoose.connection.host,
        database: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
        connectionState: this.getConnectionState(mongoose.connection.readyState),
        circuitBreaker: this.getCircuitBreakerStatus(),
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get human-readable connection state
  getConnectionState(readyState) {
    const states = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };
    return states[readyState] || 'Unknown';
  }

  // Validate MongoDB Atlas connection
  async validateAtlasConnection() {
    try {
      // Test basic operations
      const testOps = [
        { name: 'Ping', op: () => mongoose.connection.db.admin().ping() },
        { name: 'Server Info', op: () => mongoose.connection.db.admin().serverInfo() },
        { name: 'List Collections', op: () => mongoose.connection.db.listCollections().toArray() }
      ];

      const results = {};
      for (const { name, op } of testOps) {
        try {
          await this.executeWithTimeout(op, `Atlas - ${name}`, 5000);
          results[name] = 'OK';
        } catch (error) {
          results[name] = `Error: ${error.message}`;
        }
      }

      return {
        status: Object.values(results).every(r => r === 'OK') ? 'all-tests-passed' : 'some-tests-failed',
        tests: results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'validation-failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Reset metrics (useful for monitoring periods)
  resetMetrics() {
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      timeoutOperations: 0,
      averageResponseTime: 0,
      operationTimes: []
    };
    console.log('✅ Database metrics reset');
  }

  // Wrapper for Scholarship.find operations
  async findScholarships(query, options = {}) {
    return this.executeWithTimeout(async () => {
      let operation = mongoose.model('Scholarship').find(query).maxTimeMS(10000);
      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(pop => {
            if (typeof pop === 'string') {
              operation = operation.populate(pop);
            } else if (typeof pop === 'object') {
              operation = operation.populate(pop.path, pop.select);
            }
          });
        } else {
          operation = operation.populate(options.populate);
        }
      }
      if (options.skip !== undefined) operation = operation.skip(options.skip);
      if (options.limit !== undefined) operation = operation.limit(options.limit);
      if (options.sort) operation = operation.sort(options.sort);
      return await operation;
    }, 'Scholarship.find');
  }

  // Wrapper for Scholarship.findById operations
  async findScholarshipById(id, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Scholarship').findById(id).maxTimeMS(10000).setOptions(options);
    }, 'Scholarship.findById');
  }

  // Wrapper for Scholarship.create operations
  async createScholarship(data) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Scholarship').create(data);
    }, 'Scholarship.create');
  }

  // Wrapper for Scholarship.findByIdAndUpdate operations
  async updateScholarship(query, update, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Scholarship').findByIdAndUpdate(query, update, {
        ...options,
        maxTimeMS: 30000
      });
    }, 'Scholarship.findByIdAndUpdate');
  }

  // Wrapper for Scholarship.findByIdAndDelete operations
  async deleteScholarship(query, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Scholarship').findByIdAndDelete(query, options);
    }, 'Scholarship.findByIdAndDelete');
  }

  // Wrapper for Scholarship.countDocuments operations
  async countScholarships(query) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Scholarship').countDocuments(query).maxTimeMS(10000);
    }, 'Scholarship.countDocuments');
  }

  // Wrapper for User.findById operations
  async findUserById(id, options = {}) {
    return this.executeWithTimeout(async () => {
      let operation = mongoose.model('User').findById(id).maxTimeMS(10000);
      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(pop => {
            if (typeof pop === 'string') {
              operation = operation.populate(pop);
            } else if (typeof pop === 'object') {
              operation = operation.populate(pop.path, pop.select);
            }
          });
        } else {
          operation = operation.populate(options.populate);
        }
      }
      return await operation;
    }, 'User.findById');
  }

  // Wrapper for User.findOne operations
  async findUser(query, options = {}) {
    return this.executeWithTimeout(async () => {
      let operation = mongoose.model('User').findOne(query).maxTimeMS(10000);
      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(pop => {
            if (typeof pop === 'string') {
              operation = operation.populate(pop);
            } else if (typeof pop === 'object') {
              operation = operation.populate(pop.path, pop.select);
            }
          });
        } else {
          operation = operation.populate(options.populate);
        }
      }
      if (options.select) operation = operation.select(options.select);
      return await operation;
    }, 'User.findOne');
  }

  // Wrapper for User.findOneAndUpdate operations
  async updateUser(query, update, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('User').findOneAndUpdate(query, update, {
        ...options,
        maxTimeMS: 30000
      });
    }, 'User.findOneAndUpdate');
  }

  // Wrapper for University.find operations
  async findUniversities(query, options = {}) {
    return this.executeWithTimeout(async () => {
      let operation = mongoose.model('University').find(query).maxTimeMS(10000);
      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(pop => {
            if (typeof pop === 'string') {
              operation = operation.populate(pop);
            } else if (typeof pop === 'object') {
              operation = operation.populate(pop.path, pop.select);
            }
          });
        } else {
          operation = operation.populate(options.populate);
        }
      }
      if (options.skip !== undefined) operation = operation.skip(options.skip);
      if (options.limit !== undefined) operation = operation.limit(options.limit);
      if (options.sort) operation = operation.sort(options.sort);
      return await operation;
    }, 'University.find');
  }

  // Wrapper for University.countDocuments operations
  async countUniversities(query) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('University').countDocuments(query).maxTimeMS(10000);
    }, 'University.countDocuments');
  }

// Wrapper for University.findById operations
async findUniversityById(id, options = {}) {
  return this.executeWithTimeout(async () => {
    return await mongoose.model('University').findById(id).maxTimeMS(10000).setOptions(options);
  }, 'University.findById');
}

// Wrapper for University.findOne operations
async findUniversity(query, options = {}) {
  return this.executeWithTimeout(async () => {
    return await mongoose.model('University').findOne(query).maxTimeMS(10000).setOptions(options);
  }, 'University.findOne');
}

// Wrapper for University.create operations
async createUniversity(data) {
  return this.executeWithTimeout(async () => {
    return await mongoose.model('University').create(data);
  }, 'University.create');
}

// Wrapper for University.findByIdAndUpdate operations
async updateUniversity(query, update, options = {}) {
  return this.executeWithTimeout(async () => {
    return await mongoose.model('University').findByIdAndUpdate(query, update, {
      ...options,
      maxTimeMS: 30000
    });
  }, 'University.findByIdAndUpdate');
}

// Wrapper for University.findByIdAndDelete operations
async deleteUniversity(query, options = {}) {
  return this.executeWithTimeout(async () => {
    return await mongoose.model('University').findByIdAndDelete(query, options);
  }, 'University.findByIdAndDelete');
}

// Wrapper for Notification.find operations
  async findNotifications(query, options = {}) {
    return this.executeWithTimeout(async () => {
      let operation = mongoose.model('Notification').find(query).maxTimeMS(10000);
      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(pop => {
            if (typeof pop === 'string') {
              operation = operation.populate(pop);
            } else if (typeof pop === 'object') {
              operation = operation.populate(pop.path, pop.select);
            }
          });
        } else {
          operation = operation.populate(options.populate);
        }
      }
      if (options.skip !== undefined) operation = operation.skip(options.skip);
      if (options.limit !== undefined) operation = operation.limit(options.limit);
      if (options.sort) operation = operation.sort(options.sort);
      return await operation;
    }, 'Notification.find');
  }

  // Wrapper for Notification.findOneAndUpdate operations
  async updateNotification(query, update, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Notification').findOneAndUpdate(query, update, {
        ...options,
        maxTimeMS: 30000
      });
    }, 'Notification.findOneAndUpdate');
  }

  // Wrapper for Notification.findOneAndDelete operations
  async deleteNotification(query, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Notification').findOneAndDelete(query, options);
    }, 'Notification.findOneAndDelete');
  }

  // Wrapper for Notification.countDocuments operations
  async countNotifications(query) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Notification').countDocuments(query).maxTimeMS(10000);
    }, 'Notification.countDocuments');
}

  // Wrapper for Notification.updateMany operations
  async updateManyNotifications(query, update, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Notification').updateMany(query, update, {
        ...options,
        maxTimeMS: 30000
      });
    }, 'Notification.updateMany');
  }

  // Wrapper for Review.find operations
  async findReviews(query, options = {}) {
    return this.executeWithTimeout(async () => {
      let operation = mongoose.model('Review').find(query).maxTimeMS(10000);
      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(pop => {
            if (typeof pop === 'string') {
              operation = operation.populate(pop);
            } else if (typeof pop === 'object') {
              operation = operation.populate(pop.path, pop.select);
            }
          });
        } else {
          operation = operation.populate(options.populate);
        }
      }
      if (options.skip !== undefined) operation = operation.skip(options.skip);
      if (options.limit !== undefined) operation = operation.limit(options.limit);
      if (options.sort) operation = operation.sort(options.sort);
      return await operation;
    }, 'Review.find');
  }

  // Wrapper for Review.findById operations
  async findReviewById(id, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Review').findById(id).maxTimeMS(10000).setOptions(options);
    }, 'Review.findById');
  }

  // Wrapper for Review.create operations
  async createReview(data) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Review').create(data);
    }, 'Review.create');
  }

  // Wrapper for Review.findByIdAndUpdate operations
  async updateReview(query, update, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('Review').findByIdAndUpdate(query, update, {
        ...options,
        maxTimeMS: 30000
      });
    }, 'Review.findByIdAndUpdate');
  }

  // Wrapper for Review.deleteOne operations
  async deleteReview(query) {
    return this.executeWithTimeout(async () => {
      const review = await mongoose.model('Review').findById(query);
      if (review) {
        await review.deleteOne();
        return review;
      }
      return null;
    }, 'Review.deleteOne');
  }

  // Wrapper for VisaGuide.find operations
  async findVisaGuides(query = {}, options = {}) {
    return this.executeWithTimeout(async () => {
      let operation = mongoose.model('VisaGuide').find(query).maxTimeMS(10000);
      if (options.sort) operation = operation.sort(options.sort);
      return await operation;
    }, 'VisaGuide.find');
  }

  // Wrapper for VisaGuide.findOne operations
  async findVisaGuide(query, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('VisaGuide').findOne(query).maxTimeMS(10000).setOptions(options);
    }, 'VisaGuide.findOne');
  }

  // Wrapper for VisaGuide.create operations
  async createVisaGuide(data) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('VisaGuide').create(data);
    }, 'VisaGuide.create');
  }

  // Wrapper for VisaGuide.findByIdAndUpdate operations
  async updateVisaGuide(query, update, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('VisaGuide').findByIdAndUpdate(query, update, {
        ...options,
        maxTimeMS: 30000
      });
    }, 'VisaGuide.findByIdAndUpdate');
  }

  // Wrapper for VisaGuide.findByIdAndDelete operations
  async deleteVisaGuide(query, options = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model('VisaGuide').findByIdAndDelete(query, options);
    }, 'VisaGuide.findByIdAndDelete');
  }

  // Wrapper for countDocuments operations
  async countDocuments(modelName, query = {}) {
    return this.executeWithTimeout(async () => {
      return await mongoose.model(modelName).countDocuments(query).maxTimeMS(10000);
    }, `${modelName}.countDocuments`);
  }

  // Wrapper for User.find operations with pagination
  async findUsers(query = {}, options = {}) {
    return this.executeWithTimeout(async () => {
      let operation = mongoose.model('User').find(query).maxTimeMS(10000);
      if (options.select) operation = operation.select(options.select);
      if (options.skip) operation = operation.skip(options.skip);
      if (options.limit) operation = operation.limit(options.limit);
      if (options.sort) operation = operation.sort(options.sort);
      return await operation;
    }, 'User.find');
  }
  // Wrapper for User.findById operations
  async findUserById(id, options = {}) {
    return this.executeWithTimeout(async () => {
      let operation = mongoose.model('User').findById(id).maxTimeMS(10000);
      if (options.select) operation = operation.select(options.select);
      return await operation;
    }, 'User.findById');
  }
}

const dbOps = new DatabaseOperations();
module.exports = dbOps;