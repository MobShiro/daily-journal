import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaEnvelope, FaLock, FaUserPlus, FaExclamationTriangle } from 'react-icons/fa';

export default function Register() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      
      const result = await signup(emailRef.current.value, passwordRef.current.value);
      
      if (result.success) {
        navigate('/verify-otp');
      } else {
        setError(result.error || 'Failed to create an account');
      }
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Your Account</h2>
          <p>Start journaling your thoughts and experiences</p>
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
                  autoComplete="new-password"
                />
              </div>
              <p className="form-hint">Use 8+ characters with a mix of letters, numbers & symbols</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="password-confirm">Confirm Password</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <FaLock />
                </span>
                <input
                  id="password-confirm"
                  type="password"
                  ref={passwordConfirmRef}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>
          
          <div className="form-terms">
            <div className="remember-me">
              <input id="terms" type="checkbox" required />
              <label htmlFor="terms">I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="terms-link">Privacy Policy</a></label>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            <span className="btn-icon">
              <FaUserPlus />
            </span>
            {loading ? (
              <div className="loading-state">
                <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </div>
            ) : (
              'Sign up'
            )}
          </button>
        </form>
        
        <div className="auth-separator">
          <span>Already have an account?</span>
        </div>
        
        <div className="auth-redirect">
          <Link to="/login" className="redirect-btn">
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}