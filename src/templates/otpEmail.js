module.exports = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #6366f1; text-align: center;">Verify Your Email</h2>
    <p>Thank you for signing up with Daily Journal. To complete your registration, please use the verification code below:</p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
      <h1 style="letter-spacing: 8px; font-size: 32px; margin: 0;">${otp}</h1>
    </div>
    
    <p>This code will expire in 5 minutes. If you didn't request this code, you can safely ignore this email.</p>
  </div>
`;