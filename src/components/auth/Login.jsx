import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaEnvelope, FaLock, FaSignInAlt, FaExclamationTriangle } from 'react-icons/fa';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      const result = await login(emailRef.current.value, passwordRef.current.value);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to log in');
      }
    } catch (error) {
      console.error('Error in login component:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="auth-page">
      <div className="auth-card login-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue to your journal</p>
        </div>
        
        {error && (
          <div className="auth-error">
            <div className="error-icon">
              <FaExclamationTriangle />
            </div>
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <FaEnvelope />
                </span>
                <input
                  id="email"
                  type="email"
                  ref={emailRef}
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
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
                  autoComplete="current-password"
                />
              </div>
            </div>
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input id="remember-me" type="checkbox" />
              <label htmlFor="remember-me">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            <span className="btn-icon">
              <FaSignInAlt />
            </span>
            {loading ? (
              <div className="loading-state">
                <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        
        <div className="auth-separator">
          <span>New to Daily Journal?</span>
        </div>
        
        <div className="auth-redirect">
          <Link to="/register" className="redirect-btn">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}