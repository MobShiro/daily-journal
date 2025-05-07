import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Import your components
import Dashboard from './components/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyOTP from './components/auth/VerifyOTP';
import ResetPassword from './components/auth/ResetPassword';
import NotFound from './components/NotFound';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Email verification required route
const EmailVerifiedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setIsEmailVerified(userDoc.data().isEmailVerified || false);
          }
        } catch (error) {
          console.error('Error checking email verification:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);
  
  // Check if user is logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Show loading while checking verification status
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to OTP verification if email is not verified
  if (!isEmailVerified) {
    return <Navigate to="/verify-otp" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route 
            path="/verify-otp" 
            element={
              <ProtectedRoute>
                <VerifyOTP />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <EmailVerifiedRoute>
                <Dashboard />
              </EmailVerifiedRoute>
            } 
          />
          
          {/* Home route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 