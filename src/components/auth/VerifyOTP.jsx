import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaCheck, FaShieldAlt, FaSyncAlt } from 'react-icons/fa';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const { currentUser, verifyOTP, resendOTP, markEmailAsVerified } = useAuth();
  const navigate = useNavigate();
  
  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      const result = await verifyOTP(currentUser.uid, otp);
      
      if (result.verified) {
        setMessage('Email verified successfully!');
        await markEmailAsVerified(currentUser.uid);
        // Redirect after successful verification
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(result.error || 'Failed to verify OTP');
      }
    } catch (error) {
      setError('Failed to verify code: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
  
  // Handle resend OTP
  async function handleResendOTP() {
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      const result = await resendOTP(currentUser.uid);
      
      if (result.success) {
        setMessage('New verification code sent!');
        setTimeLeft(300); // Reset timer to 5 minutes
      } else {
        setError(result.error || 'Failed to resend verification code');
      }
    } catch (error) {
      setError('Failed to resend code: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Verify Your Email</h2>
          <p>Enter the 6-digit code sent to your email</p>
        </div>
        
        {error && (
          <div className="auth-error">
            <div className="error-icon">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9v4a1 1 0 11-2 0v-4a1 1 0 112 0zm-1-5a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
            </div>
            <p>{error}</p>
          </div>
        )}
        
        {message && (
          <div className="auth-success">
            <div className="success-icon">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p>{message}</p>
          </div>
        )}
        
        <div className="otp-verification-content">
          <div className="otp-icon">
            <FaShieldAlt size={48} />
          </div>
          
          <p className="otp-info">
            We've sent a verification code to:<br />
            <strong>{currentUser?.email}</strong>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="otp">Verification Code</label>
              <div className="input-with-icon otp-input-wrapper">
                <span className="input-icon">
                  <FaCheck />
                </span>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  className="otp-input"
                />
              </div>
            </div>
          </div>
          
          <div className="timer-display">
            {timeLeft > 0 ? (
              <p className="timer">Code expires in: {formatTime(timeLeft)}</p>
            ) : (
              <p className="timer expired">Code expired</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? (
              <div className="loading-state">
                <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </div>
            ) : (
              'Verify Code'
            )}
          </button>
        </form>
        
        <div className="resend-code">
          <button 
            onClick={handleResendOTP} 
            disabled={loading || timeLeft > 0} 
            className="resend-btn"
          >
            <FaSyncAlt className="mr-2" /> 
            {timeLeft > 0 ? `Resend code in ${formatTime(timeLeft)}` : 'Resend verification code'}
          </button>
        </div>
      </div>
    </div>
  );
}