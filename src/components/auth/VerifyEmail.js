import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your Email</h2>
        <p>We've sent a verification email to your inbox. Please check your email and click the verification link.</p>
        {currentUser && !currentUser.emailVerified && (
          <>
            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}
            <button 
              onClick={handleSendVerificationEmail} 
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </>
        )}
        <div className="auth-redirect mt-3">
          <Link to="/dashboard">Continue to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}