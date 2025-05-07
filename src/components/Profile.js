import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaEnvelope, FaCalendarAlt, FaCheck, FaTimes, FaPen } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { 
    currentUser, 
    sendVerificationEmail, 
    updateUserProfile, 
    deleteUserAccount,
    logout 
  } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  
  const navigate = useNavigate();

  // Update displayName state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      // Ensure we have the latest verification status
      setEmailVerified(currentUser.emailVerified);
    }
  }, [currentUser]);

  // Ensure we always have the latest email verification status
  useEffect(() => {
    // Firebase sometimes caches the emailVerified status
    // This forces a refresh of the user data to get the most recent status
    const refreshUserData = async () => {
      if (currentUser) {
        try {
          await currentUser.reload();
          setEmailVerified(currentUser.emailVerified);
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }
    };
    
    refreshUserData();
  }, [currentUser]);

  async function handleVerifyEmail() {
    try {
      setMessage('');
      setError('');
      setLoading(true);
      const result = await sendVerificationEmail();
      
      if (result.success) {
        setMessage('Verification email sent. Please check your inbox.');
      } else {
        setError(result.error || 'Failed to send verification email.');
      }
    } catch (error) {
      setError('Failed to send verification email: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      const result = await updateUserProfile(displayName);
      
      if (result.success) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to update profile.');
      }
    } catch (error) {
      setError('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      const result = await deleteUserAccount();
      
      if (result.success) {
        // Redirect to login page after successful account deletion
        await logout();
        navigate('/login');
      } else {
        setError(result.error || 'Failed to delete account.');
      }
    } catch (error) {
      setError('Failed to delete account: ' + error.message);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
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
            {isEditing ? (
              <input 
                type="text" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                className="form-control"
                placeholder="Your name"
              />
            ) : (
              <h3>{currentUser?.displayName || 'User'}</h3>
            )}
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
              {emailVerified ? (
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
          {isEditing ? (
            <>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              className="btn btn-secondary"
              onClick={() => setIsEditing(true)}
            >
              <FaPen /> Edit Profile
            </button>
          )}
          
          {showDeleteConfirm ? (
            <div className="delete-confirm">
              <p className="text-danger">Are you sure you want to delete your account? This cannot be undone.</p>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}