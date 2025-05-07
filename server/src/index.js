const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://daily-journal-fc04c.web.app'], // Add your domain
  credentials: true
}));

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Email service is running' });
});

// Email sending endpoint
app.post('/api/send-otp-email', async (req, res) => {
  try {
    const { email, otp, userId } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }
    
    // Email content
    const mailOptions = {
      from: '"Daily Journal" <bmamao177@gmail.com>',
      to: email,
      subject: 'Your Verification Code for Daily Journal',
      text: `Your verification code is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1; text-align: center;">Verify Your Email</h2>
          <p>Thank you for signing up with Daily Journal. To complete your registration, please use the verification code below:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <h1 style="letter-spacing: 8px; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          
          <p>This code will expire in 5 minutes. If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `
    };
    
    // Send email
    console.log(`Sending OTP ${otp} to ${email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    
    res.status(200).json({
      success: true,
      message: 'OTP email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP email',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Email service running on port ${PORT}`);
});