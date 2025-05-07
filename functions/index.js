const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();

// Simple function to test deployment
exports.hello = functions.https.onRequest((req, res) => {
  res.send('Hello from Firebase Functions!');
});

// Function to test email sending
exports.sendTestEmail = functions.https.onRequest(async (req, res) => {
  try {
    const recipient = req.query.email || 'bmamao177@gmail.com';
    
    // Get password from Firebase config
    let gmailPassword;
    try {
      gmailPassword = functions.config().gmail.password;
    } catch (e) {
      gmailPassword = 'wpni wqmc dlyw sbzy'; // Fallback if config not available
    }
    
    console.log(`Attempting to send email to: ${recipient}`);
    
    // Create transporter for sending emails
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'bmamao177@gmail.com',
        pass: gmailPassword
      }
    });
    
    // Email content
    const mailOptions = {
      from: '"Daily Journal" <bmamao177@gmail.com>',
      to: recipient,
      subject: 'Test Email from Daily Journal',
      text: 'This is a test email to verify that email sending works',
      html: '<h1>Test Email</h1><p>If you received this email, your email setup is working correctly!</p>'
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    res.status(200).send({
      success: true,
      message: 'Test email sent successfully',
      recipient: recipient,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).send({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Function to send OTP email when a new verification document is created
exports.sendOTPEmail = functions.firestore
  .document('otpVerifications/{userId}')
  .onCreate(async (snapshot, context) => {
    try {
      const userData = snapshot.data();
      const { email, otp } = userData;
      
      if (!email || !otp) {
        console.error('Missing email or OTP in the document');
        return null;
      }
      
      console.log(`Sending OTP ${otp} to ${email}`);
      
      // Get password from Firebase config
      let gmailPassword;
      try {
        gmailPassword = functions.config().gmail.password;
      } catch (e) {
        gmailPassword = 'wpni wqmc dlyw sbzy'; // Fallback if config not available
      }
      
      // Create transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'bmamao177@gmail.com',
          pass: gmailPassword
        }
      });
      
      // Prepare email
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
      const info = await transporter.sendMail(mailOptions);
      console.log('OTP email sent successfully:', info.messageId);
      
      // Update document to indicate email was sent
      await admin.firestore().collection('otpVerifications').doc(context.params.userId).update({
        emailSent: true,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return null;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      
      // Update document to indicate email failed
      try {
        await admin.firestore().collection('otpVerifications').doc(context.params.userId).update({
          emailSent: false,
          emailError: error.message
        });
      } catch (updateError) {
        console.error('Error updating document:', updateError);
      }
      
      return null;
    }
  });