const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email templates
const templates = {
  emailVerification: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to StudyBridge!</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.userName},</h2>
          <p>Thank you for registering with StudyBridge. Please verify your email address to complete your registration.</p>
          <p>Click the button below to verify your email:</p>
          <a href="${data.verificationUrl}" class="button">Verify Email</a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${data.verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 StudyBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  passwordReset: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.userName},</h2>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <a href="${data.resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${data.resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 StudyBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  deadlineReminder: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .urgent { background: #fff3cd; border-left: 4px solid #ff6b6b; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Application Deadline Reminder</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.userName},</h2>
          <div class="urgent">
            <p><strong>Important:</strong> Only ${data.daysLeft} days left until the application deadline!</p>
          </div>
          <p><strong>University:</strong> ${data.universityName}</p>
          <p><strong>Deadline:</strong> ${data.deadline}</p>
          <p>Please ensure you submit your application before the deadline to avoid missing this opportunity.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 StudyBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  scholarshipReminder: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .scholarship { background: white; border-radius: 5px; padding: 15px; margin: 10px 0; border-left: 4px solid #f5576c; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Scholarship Deadline Reminder</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.userName},</h2>
          <p>The following scholarship(s) you saved have upcoming deadlines:</p>
          ${data.scholarships.map(s => `
            <div class="scholarship">
              <h3>${s.name}</h3>
              <p><strong>Deadline:</strong> ${new Date(s.deadline).toLocaleDateString()}</p>
              <p><strong>Amount:</strong> ${s.amount.value} ${s.amount.currency}</p>
            </div>
          `).join('')}
          <p>Don't miss these opportunities! Apply before the deadline.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 StudyBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
};

// Send email function
exports.sendEmail = async ({ to, subject, template, data }) => {
  try {
    const html = templates[template] ? templates[template](data) : data.html;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

// Verify transporter
exports.verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
  } catch (error) {
    console.error('❌ Email service error:', error);
  }
};