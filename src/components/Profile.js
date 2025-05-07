import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaEnvelope, FaCalendarAlt, FaCheck, FaTimes, FaPen } from 'react-icons/fa';
import { format } from 'date-fns';

export default function Profile() {
  const { currentUser, sendVerificationEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleVerifyEmail() {
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await sendVerificationEmail();
      setMessage('Verification email sent. Please check your inbox.');
    } catch (error) {
      setError('Failed to send verification email: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const creationTime = currentUser?.metadata?.creationTime 
    ? format(new Date(currentUser.metadata.creationTime), 'PPpp')
    : 'N/A';
    
  const lastSignInTime = currentUser?.metadata?.lastSignInTime
    ? format(new Date(currentUser.metadata.lastSignInTime), 'PPpp')
    : 'N/A';

  return (
    <div className="profile-container fade-in">
      <div className="profile-header">
        <h2>Your Profile</h2>
        <p className="text-muted">Manage your account details</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="profile-card">
        <div className="profile-avatar">
          {currentUser?.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt="Profile" 
              className="avatar-img" 
            />
          ) : (
            <FaUserCircle size={80} color="var(--primary-color)" />
          )}
          
          <div className="profile-name">
            <h3>{currentUser?.displayName || 'User'}</h3>
            <span className="joined-date">
              <FaCalendarAlt /> Joined {format(new Date(currentUser?.metadata?.creationTime), 'MMMM yyyy')}
            </span>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <div className="detail-label">
              <FaEnvelope /> Email
            </div>
            <div className="detail-value">
              {currentUser?.email}
              {currentUser?.emailVerified ? (
                <span className="verification-badge verified">
                  <FaCheck /> Verified
                </span>
              ) : (
                <span className="verification-badge not-verified">
                  <FaTimes /> Not Verified
                  <button 
                    onClick={handleVerifyEmail}
                    className="verify-btn"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Verify Now'}
                  </button>
                </span>
              )}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">
              <FaCalendarAlt /> Account Created
            </div>
            <div className="detail-value">
              {creationTime}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">
              <FaCalendarAlt /> Last Sign In
            </div>
            <div className="detail-value">
              {lastSignInTime}
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn btn-secondary">
            <FaPen /> Edit Profile
          </button>
          <button className="btn btn-danger">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}