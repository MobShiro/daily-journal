import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  
  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const { db } = await import('../firebase');
          const { doc, getDoc } = await import('firebase/firestore');
          
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to load user data');
        }
      }
    };
    
    fetchUserData();
  }, [currentUser]);
  
  async function handleLogout() {
    setError('');
    
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out: ' + error.message);
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Profile</h3>
          <p className="text-gray-700"><strong>Email:</strong> {currentUser?.email}</p>
          <p className="text-gray-700">
            <strong>Email Status:</strong> {userData?.isEmailVerified ? 'Verified' : 'Not Verified'}
          </p>
          <p className="text-gray-700">
            <strong>Account Created:</strong> {userData?.createdAt?.toDate().toLocaleDateString() || 'Unknown'}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Log Out
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Journal</h3>
        <p className="text-gray-700 mb-4">
          Welcome to your Daily Journal! This is where you'll be able to create and manage your journal entries.
        </p>
        <button className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Create New Entry
        </button>
      </div>
    </div>
  );
}