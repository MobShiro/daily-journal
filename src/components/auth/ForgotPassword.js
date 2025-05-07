import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage('Check your inbox for password reset instructions');
    } catch (error) {
      setError('Failed to reset password. ' + error.message);
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Password Reset</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" ref={emailRef} required />
          </div>
          <button disabled={loading} className="btn btn-primary" type="submit">
            Reset Password
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
        <div className="auth-redirect">
          Need an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}