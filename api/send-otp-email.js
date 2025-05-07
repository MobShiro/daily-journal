// Vercel serverless function for sending OTP emails
const nodemailer = require('nodemailer');

// Email template function - embedded directly to avoid import issues on Vercel
const otpEmailTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #6366f1; text-align: center;">Verify Your Email</h2>
    <p>Thank you for signing up with Daily Journal. To complete your registration, please use the verification code below:</p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
      <h1 style="letter-spacing: 8px; font-size: 32px; margin: 0;">${otp}</h1>
    </div>
    
    <p>This code will expire in 5 minutes. If you didn't request this code, you can safely ignore this email.</p>
  </div>
`;

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Update this with your Vercel domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, otp, userId } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }
    
    // Email transporter configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'bmamao177@gmail.com',
        pass: process.env.EMAIL_PASSWORD || process.env.GMAIL_PASSWORD
      }
    });
    
    // Email content
    const mailOptions = {
      from: '"Daily Journal" <bmamao177@gmail.com>',
      to: email,
      subject: 'Your Verification Code for Daily Journal',
      text: `Your verification code is: ${otp}`,
      html: otpEmailTemplate(otp)
    };
    
    // Send email
    console.log(`Sending OTP ${otp} to ${email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    
    return res.status(200).json({
      success: true,
      message: 'OTP email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP email',
      error: error.message
    });
  }
};