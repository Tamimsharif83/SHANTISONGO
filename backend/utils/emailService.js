const nodemailer = require("nodemailer");

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send approval email with credentials
const sendApprovalEmail = async (recipientEmail, recipientName, memberID, initialPassword) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SHANTISONGHO" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: "🎉 Your Membership Application has been Approved!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .credentials-box {
              background-color: #e8f5e9;
              border-left: 4px solid #4CAF50;
              padding: 15px;
              margin: 20px 0;
            }
            .credential-item {
              margin: 10px 0;
              font-size: 16px;
            }
            .credential-label {
              font-weight: bold;
              color: #2e7d32;
            }
            .credential-value {
              font-family: 'Courier New', monospace;
              background-color: #fff;
              padding: 5px 10px;
              border-radius: 3px;
              display: inline-block;
              margin-left: 10px;
            }
            .warning-box {
              background-color: #fff3cd;
              border-left: 4px solid #ff9800;
              padding: 15px;
              margin: 20px 0;
            }
            .warning-title {
              font-weight: bold;
              color: #f57c00;
              font-size: 18px;
              margin-bottom: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to SHANTISONGHO!</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${recipientName}</strong>,</p>
              
              <p>Congratulations! Your membership application has been <strong>approved</strong>. We are delighted to welcome you as a member of SHANTISONGHO.</p>
              
              <div class="credentials-box">
                <h3 style="margin-top: 0; color: #2e7d32;">Your Account Credentials:</h3>
                <div class="credential-item">
                  <span class="credential-label">Member ID:</span>
                  <span class="credential-value">${memberID}</span>
                </div>
                <div class="credential-item">
                  <span class="credential-label">Initial Password:</span>
                  <span class="credential-value">${initialPassword}</span>
                </div>
              </div>
              
              <div class="warning-box">
                <div class="warning-title">⚠️ IMPORTANT SECURITY NOTICE</div>
                <p><strong>Please change your password immediately after your first login.</strong></p>
                <p>For your account security, it is crucial that you:</p>
                <ul>
                  <li>Log in to your account as soon as possible</li>
                  <li>Change your initial password to a strong, unique password</li>
                  <li>Do not share your credentials with anyone</li>
                  <li>Keep your password confidential</li>
                </ul>
              </div>
              
              <p>You can now log in to your member dashboard and access all member features.</p>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>
              <strong>SHANTISONGHO Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} SHANTISONGHO. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendApprovalEmail
};
