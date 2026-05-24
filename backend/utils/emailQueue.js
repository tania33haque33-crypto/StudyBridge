const nodemailer = require('nodemailer');
const { sendEmail } = require('./emailService');

class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  async add(emailData) {
    const emailJob = {
      id: Date.now() + Math.random(),
      data: emailData,
      attempts: 0,
      status: 'pending',
      createdAt: new Date(),
    };

    this.queue.push(emailJob);
    console.log(`Email job added to queue: ${emailJob.id}`);

    if (!this.processing) {
      this.processQueue();
    }

    return emailJob.id;
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue[0];

      try {
        console.log(`Processing email job: ${job.id}, Attempt: ${job.attempts + 1}`);
        
        await sendEmail(job.data);
        
        job.status = 'completed';
        job.completedAt = new Date();
        console.log(`Email job completed: ${job.id}`);
        
        // Remove from queue
        this.queue.shift();
      } catch (error) {
        job.attempts++;
        console.error(`Email job failed: ${job.id}, Error:`, error.message);

        if (job.attempts >= this.maxRetries) {
          job.status = 'failed';
          job.error = error.message;
          job.failedAt = new Date();
          console.error(`Email job permanently failed: ${job.id}`);
          
          // Remove failed job
          this.queue.shift();
        } else {
          // Retry after delay
          console.log(`Retrying email job: ${job.id} after ${this.retryDelay}ms`);
          await this.delay(this.retryDelay);
        }
      }
    }

    this.processing = false;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      jobs: this.queue.map(job => ({
        id: job.id,
        status: job.status,
        attempts: job.attempts,
        createdAt: job.createdAt,
      })),
    };
  }

  clearQueue() {
    this.queue = [];
    this.processing = false;
    console.log('Email queue cleared');
  }

  // Bulk email sending
  async addBulk(emailDataArray) {
    const jobIds = [];
    
    for (const emailData of emailDataArray) {
      const jobId = await this.add(emailData);
      jobIds.push(jobId);
    }

    return jobIds;
  }

  // Priority email (skip queue)
  async sendPriority(emailData) {
    try {
      await sendEmail(emailData);
      return { success: true, message: 'Priority email sent' };
    } catch (error) {
      throw error;
    }
  }

  // Schedule email for later
  scheduleEmail(emailData, sendAt) {
    const delay = new Date(sendAt) - new Date();
    
    if (delay <= 0) {
      return this.add(emailData);
    }

    setTimeout(() => {
      this.add(emailData);
    }, delay);

    return {
      success: true,
      message: 'Email scheduled',
      sendAt,
    };
  }
}

// Singleton instance
const emailQueue = new EmailQueue();

module.exports = emailQueue;