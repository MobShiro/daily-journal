import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaBook, FaPen, FaChartBar, FaCalendarAlt, FaUserEdit } from 'react-icons/fa';
import { format } from 'date-fns';
import '../styles/main.css'; 

export default function Dashboard() {
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statCards, setStatCards] = useState({
    totalEntries: 0,
    totalWords: 0,
    moodDistribution: {},
    streakDays: 0
  });
  
  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          const { db } = await import('../firebase');
          const { doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
          
          // Get user profile
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
          
          // Get journal entries for stats
          const entriesRef = collection(db, 'entries');
          const userEntriesQuery = query(entriesRef, where('userId', '==', currentUser.uid));
          const entriesSnapshot = await getDocs(userEntriesQuery);
          
          let totalEntries = entriesSnapshot.size;
          let totalWords = 0;
          let moodCounts = {};
          let dates = [];
          
          entriesSnapshot.forEach(doc => {
            const entry = doc.data();
            
            // Count words
            const wordCount = entry.content
              ? entry.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
              : 0;
            totalWords += wordCount;
            
            // Count moods
            if (entry.mood) {
              moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
            }
            
            // Get entry dates for streak calculation
            if (entry.date) {
              dates.push(new Date(entry.date.seconds * 1000));
            }
          });
          
          // Calculate streak (simplified)
          let streakDays = 0;
          if (dates.length > 0) {
            // Sort dates in descending order
            dates.sort((a, b) => b - a);
            
            // Check if the most recent entry is from today or yesterday
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const mostRecentDate = new Date(dates[0]);
            mostRecentDate.setHours(0, 0, 0, 0);
            
            const timeDiff = today - mostRecentDate;
            const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 1) { // today or yesterday
              streakDays = 1;
              
              // Count consecutive days
              for (let i = 1; i < dates.length; i++) {
                const currentDate = new Date(dates[i-1]);
                const prevDate = new Date(dates[i]);
                
                currentDate.setHours(0, 0, 0, 0);
                prevDate.setHours(0, 0, 0, 0);
                
                const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                  streakDays++;
                } else {
                  break;
                }
              }
            }
          }
          
          setStatCards({
            totalEntries,
            totalWords,
            moodDistribution: moodCounts,
            streakDays
          });
          
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to load user data');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchUserData();
  }, [currentUser]);
  
  // Get the dominant mood (most frequent)
  const getDominantMood = () => {
    const { moodDistribution } = statCards;
    if (!moodDistribution || Object.keys(moodDistribution).length === 0) return null;
    
    return Object.keys(moodDistribution).reduce((a, b) => 
      moodDistribution[a] > moodDistribution[b] ? a : b
    );
  };
  
  const getMoodEmoji = (mood) => {
    switch(mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'neutral': return '😐';
      case 'excited': return '🎉';
      case 'tired': return '😴';
      default: return '📝';
    }
  };
  
  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Welcome to Your Journal Dashboard</h2>
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

      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner-large"></div>
          <p>Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/* User Welcome Card */}
          <div className="card welcome-card">
            <div className="welcome-content">
              <div className="welcome-icon">
                <FaBook size={32} />
              </div>
              <div className="welcome-text">
                <h3>Hello, {userData?.displayName || currentUser?.email?.split('@')[0] || 'Writer'}!</h3>
                <p>
                  {new Date().getHours() < 12 ? "Good morning" : 
                   new Date().getHours() < 18 ? "Good afternoon" : "Good evening"}! 
                  What would you like to write about today?
                </p>
              </div>
            </div>
            <Link to="/new-entry" className="btn btn-primary">
              <FaPen /> Write New Entry
            </Link>
          </div>
          
          {/* Stats Cards */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FaBook />
              </div>
              <div>
                <div className="stat-title">Total Entries</div>
                <div className="stat-value">{statCards.totalEntries}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaChartBar />
              </div>
              <div>
                <div className="stat-title">Total Words Written</div>
                <div className="stat-value">{statCards.totalWords}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                {getDominantMood() && getMoodEmoji(getDominantMood())}
              </div>
              <div>
                <div className="stat-title">Most Common Mood</div>
                <div className="stat-value">
                  {getDominantMood() ? 
                    getDominantMood().charAt(0).toUpperCase() + getDominantMood().slice(1) : 
                    'No entries yet'}
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaCalendarAlt />
              </div>
              <div>
                <div className="stat-title">Current Streak</div>
                <div className="stat-value">{statCards.streakDays} days</div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions-grid">
              <Link to="/entries" className="quick-action-card">
                <FaBook className="quick-action-icon" />
                <div className="quick-action-text">View All Entries</div>
              </Link>
              <Link to="/new-entry" className="quick-action-card">
                <FaPen className="quick-action-icon" />
                <div className="quick-action-text">Write New Entry</div>
              </Link>
              <Link to="/profile" className="quick-action-card">
                <FaUserEdit className="quick-action-icon" />
                <div className="quick-action-text">Edit Profile</div>
              </Link>
            </div>
          </div>
          
          {/* Account Information */}
          <div className="account-info-card">
            <h3 className="section-title">Account Information</h3>
            <div className="account-details">
              <div className="account-detail">
                <strong>Email:</strong> {currentUser?.email}
                <span className={`verification-badge ${userData?.isEmailVerified ? 'verified' : 'not-verified'}`}>
                  {userData?.isEmailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              <div className="account-detail">
                <strong>Account Created:</strong> 
                {userData?.createdAt ? 
                  format(userData.createdAt.toDate(), 'MMMM d, yyyy') : 
                  'Unknown'}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}