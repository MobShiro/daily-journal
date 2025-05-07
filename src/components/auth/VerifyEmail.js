import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaEnvelope, FaArrowRight, FaSyncAlt } from 'react-icons/fa';

export default function VerifyEmail() {
  const { currentUser, sendVerificationEmail } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendVerificationEmail() {
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await sendVerificationEmail();
      setMessage('Verification email has been sent to your inbox');
    } catch (error) {
      setError('Failed to send verification email. ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Verify Your Email</h2>
          <p>Please check your email and click the verification link we sent you</p>
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
        
        <div className="verify-email-content">
          <div className="verify-email-icon">
            <FaEnvelope size={48} />
          </div>
          
          <p className="verify-email-info">
            We've sent a verification email to:<br />
            <strong>{currentUser?.email}</strong>
          </p>
          
          <p className="verify-email-instructions">
            Click the verification link in the email to verify your account.
            If you don't see the email, check your spam folder.
          </p>
        </div>

        {currentUser && !currentUser.emailVerified && (
          <button 
            onClick={handleSendVerificationEmail} 
            disabled={loading}
            className="submit-btn mt-4"
          >
            {loading ? (
              <div className="loading-state">
                <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </div>
            ) : (
              <>
                <FaSyncAlt className="mr-2" /> Resend Verification Email
              </>
            )}
          </button>
        )}
        
        <div className="auth-separator">
          <span>or</span>
        </div>
        
        <div className="auth-redirect">
          <Link to="/dashboard" className="redirect-btn">
            Continue to Dashboard <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}