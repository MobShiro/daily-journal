import React, { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaLock, FaKey, FaArrowLeft } from 'react-icons/fa';

export default function ResetPassword() {
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { resetPasswordWithToken } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token and email from URL params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const email = queryParams.get('email');

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }
    
    if (passwordRef.current.value.length < 6) {
      return setError('Password should be at least 6 characters');
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      // Call the actual reset password function
      const result = await resetPasswordWithToken(email, token, passwordRef.current.value);
      
      if (result.success) {
        setMessage('Password has been reset successfully!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('Failed to reset password: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // If no token or email is provided, show an error
  if (!token || !email) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Invalid Password Reset Link</h2>
            <p>The password reset link is invalid or has expired.</p>
          </div>
          
          <div className="auth-error">
            <div className="error-icon">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9v4a1 1 0 11-2 0v-4a1 1 0 112 0zm-1-5a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
            </div>
            <p>Please request a new password reset link.</p>
          </div>
          
          <div className="auth-redirect">
            <Link to="/forgot-password" className="redirect-btn">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Set New Password</h2>
          <p>Create a secure new password for your account</p>
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
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <FaLock />
                </span>
                <input
                  id="password"
                  type="password"
                  ref={passwordRef}
                  required
                  placeholder="••••••••"
                />
              </div>
              <p className="form-hint">Use 8+ characters with a mix of letters, numbers & symbols</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="password-confirm">Confirm New Password</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <FaKey />
                </span>
                <input
                  id="password-confirm"
                  type="password"
                  ref={passwordConfirmRef}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>
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
                Resetting Password...
              </div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
        
        <div className="auth-redirect mt-4">
          <Link to="/login" className="back-link">
            <FaArrowLeft /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}