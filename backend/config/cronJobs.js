const cron = require('node-cron');
const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');
const { emitToUser } = require('./socket');

const start = () => {
  // Check application deadlines daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('Running deadline reminder job...');
      
      const today = new Date();
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Find applications with upcoming deadlines
      const applications = await Application.find({
        status: { $in: ['Not Started', 'In Progress'] },
        deadline: { $lte: oneWeekFromNow, $gte: today }
      }).populate('userId universityId');

      for (const app of applications) {
        const daysLeft = Math.ceil((app.deadline - today) / (1000 * 60 * 60 * 24));
        
        let message = '';
        if (daysLeft <= 3) {
          message = `Urgent: Only ${daysLeft} days left for your application to ${app.universityId.name}!`;
        } else {
          message = `Reminder: ${daysLeft} days left for your application to ${app.universityId.name}`;
        }

        // Create notification
        await Notification.create({
          userId: app.userId._id,
          type: 'deadline',
          title: 'Application Deadline Approaching',
          message,
          relatedModel: 'Application',
          relatedId: app._id
        });

        // Send email
        await sendEmail({
          to: app.userId.email,
          subject: 'Application Deadline Reminder',
          template: 'deadlineReminder',
          data: {
            userName: app.userId.firstName,
            universityName: app.universityId.name,
            daysLeft,
            deadline: app.deadline.toLocaleDateString()
          }
        });

        // Emit real-time notification
        emitToUser(app.userId._id.toString(), 'notification', {
          type: 'deadline',
          message
        });
      }

      console.log(`Sent ${applications.length} deadline reminders`);
    } catch (error) {
      console.error('Deadline reminder job error:', error);
    }
  });

  // Check scholarship deadlines daily at 10 AM
  cron.schedule('0 10 * * *', async () => {
    try {
      console.log('Running scholarship deadline job...');
      
      const today = new Date();
      const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const scholarships = await Scholarship.find({
        deadline: { $lte: oneWeekFromNow, $gte: today },
        isActive: true
      });

      // Find users who have saved these scholarships
      const users = await User.find({
        'savedScholarships': { $in: scholarships.map(s => s._id) }
      });

      for (const user of users) {
        const userScholarships = scholarships.filter(s => 
          user.savedScholarships.some(saved => saved.toString() === s._id.toString())
        );

        if (userScholarships.length > 0) {
          await Notification.create({
            userId: user._id,
            type: 'scholarship',
            title: 'Scholarship Deadline Approaching',
            message: `${userScholarships.length} saved scholarship(s) deadline approaching soon!`
          });

          await sendEmail({
            to: user.email,
            subject: 'Scholarship Deadline Reminder',
            template: 'scholarshipReminder',
            data: {
              userName: user.firstName,
              scholarships: userScholarships
            }
          });
        }
      }

      console.log('Scholarship reminders sent');
    } catch (error) {
      console.error('Scholarship reminder job error:', error);
    }
  });

  // Clean up old notifications monthly
  cron.schedule('0 0 1 * *', async () => {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const result = await Notification.deleteMany({
        createdAt: { $lt: threeMonthsAgo },
        isRead: true
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
    } catch (error) {
      console.error('Notification cleanup job error:', error);
    }
  });

  console.log('✅ Cron jobs initialized');
};

module.exports = { start };