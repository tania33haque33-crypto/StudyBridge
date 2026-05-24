const emailTemplates = {
  welcome: (data) => `
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
        ul { padding-left: 20px; }
        li { margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to StudyBridge! 🎓</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.userName},</h2>
          <p>Congratulations! You've taken the first step towards your international education journey.</p>
          
          <h3>What's Next?</h3>
          <ul>
            <li>✅ Complete your profile with academic details</li>
            <li>🔍 Browse 10,000+ universities worldwide</li>
            <li>💰 Discover scholarship opportunities</li>
            <li>📝 Start tracking your applications</li>
          </ul>

          <p>Ready to get started?</p>
          <a href="${data.dashboardUrl}" class="button">Go to Dashboard</a>

          <p>If you have any questions, our support team is here to help!</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 StudyBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  applicationStatusUpdate: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
        .accepted { background: #10b981; color: white; }
        .rejected { background: #ef4444; color: white; }
        .under-review { background: #f59e0b; color: white; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Status Update</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.userName},</h2>
          <p>Your application status has been updated!</p>

          <div class="info-box">
            <p><strong>University:</strong> ${data.universityName}</p>
            <p><strong>Program:</strong> ${data.programName}</p>
            <p><strong>Application Number:</strong> ${data.applicationNumber}</p>
            <p><strong>New Status:</strong> <span class="status-badge ${data.statusClass}">${data.status}</span></p>
          </div>

          ${data.message ? `<p>${data.message}</p>` : ''}

          <p>View your application details to learn more.</p>
          <a href="${data.applicationUrl}" class="button">View Application</a>
        </div>
        <div class="footer">
          <p>&copy; 2024 StudyBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  scholarshipAlert: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .scholarship-card { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f5576c; }
        .amount { font-size: 28px; font-weight: bold; color: #f5576c; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 New Scholarship Match!</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.userName},</h2>
          <p>Great news! We found a scholarship that matches your profile:</p>

          <div class="scholarship-card">
            <h3>${data.scholarshipName}</h3>
            <p class="amount">${data.amount}</p>
            <p><strong>Provider:</strong> ${data.provider}</p>
            <p><strong>Deadline:</strong> ${data.deadline}</p>
            <p><strong>Country:</strong> ${data.country}</p>
          </div>

          <p>Don't miss this opportunity! Apply before the deadline.</p>
          <a href="${data.scholarshipUrl}" class="button">View Scholarship</a>
        </div>
        <div class="footer">
          <p>&copy; 2024 StudyBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

module.exports = emailTemplates;