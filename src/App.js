import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { JournalProvider } from './contexts/JournalContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Import your components
import Dashboard from './components/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyOTP from './components/auth/VerifyOTP';
import ResetPassword from './components/auth/ResetPassword';
import NotFound from './components/NotFound';
import Layout from './components/ui/Layout';
import ForgotPassword from './components/auth/ForgotPassword';
import EntryList from './components/journal/EntryList';
import EntryView from './components/journal/EntryView';
import EntryForm from './components/journal/EntryForm';
import EditEntry from './components/journal/EditEntry';
import Profile from './components/Profile';
import Homepage from './components/Homepage';

import './styles/main.css';

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
        <ThemeProvider>
          <JournalProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Homepage */}
              <Route path="/" element={<Homepage />} />
              
              {/* Protected routes */}
              <Route 
                path="/verify-otp" 
                element={
                  <ProtectedRoute>
                    <VerifyOTP />
                  </ProtectedRoute>
                } 
              />
              
              {/* Routes requiring email verification */}
              <Route 
                path="/dashboard" 
                element={
                  <EmailVerifiedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </EmailVerifiedRoute>
                } 
              />
              
              <Route 
                path="/entries" 
                element={
                  <EmailVerifiedRoute>
                    <Layout>
                      <EntryList />
                    </Layout>
                  </EmailVerifiedRoute>
                } 
              />
              
              <Route 
                path="/entry/:id" 
                element={
                  <EmailVerifiedRoute>
                    <Layout>
                      <EntryView />
                    </Layout>
                  </EmailVerifiedRoute>
                } 
              />
              
              <Route 
                path="/new-entry" 
                element={
                  <EmailVerifiedRoute>
                    <Layout>
                      <EntryForm />
                    </Layout>
                  </EmailVerifiedRoute>
                } 
              />
              
              <Route 
                path="/edit-entry/:id" 
                element={
                  <EmailVerifiedRoute>
                    <Layout>
                      <EditEntry />
                    </Layout>
                  </EmailVerifiedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <EmailVerifiedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </EmailVerifiedRoute>
                } 
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </JournalProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;