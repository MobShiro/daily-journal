import { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // API URL - change this to your deployed API URL in production
  const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-deployed-api-url.com' // Change to your deployed API URL
  : 'http://localhost:3001';
  
  // Generate a 6-digit OTP code
  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  // Create OTP verification record and send email
  async function createOtpVerification(userId, email) {
    try {
      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5); // Expires in 5 minutes
      
      // Create OTP document in Firestore
      const otpDocRef = doc(db, 'otpVerifications', userId);
      await setDoc(otpDocRef, {
        email,
        otp,
        createdAt: serverTimestamp(),
        expiresAt,
        verified: false
      });
      
      console.log("OTP document created successfully");
      
      // Fetch the OTP document to ensure it was created
      const otpDoc = await getDoc(otpDocRef);
      if (!otpDoc.exists()) {
        throw new Error('OTP document was not created');
      }
      
      // Send OTP via email using our API
      const response = await fetch(`${API_URL}/api/send-otp-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, userId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update document to indicate email was sent
        await updateDoc(otpDocRef, {
          emailSent: true,
          emailSentAt: new Date()
        });
        console.log('OTP email sent successfully');
        return { success: true, otp };
      } else {
        console.error('Failed to send OTP email:', result);
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Error in OTP verification process:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Verify OTP code
  async function verifyOTP(userId, enteredOtp) {
    try {
      const otpDocRef = doc(db, 'otpVerifications', userId);
      const otpDoc = await getDoc(otpDocRef);
      
      if (!otpDoc.exists()) {
        return { verified: false, error: 'No verification record found' };
      }
      
      const { otp, expiresAt } = otpDoc.data();
      
      // Check if OTP has expired
      if (new Date() > new Date(expiresAt.toDate())) {
        return { verified: false, error: 'OTP has expired' };
      }
      
      // Check if OTP matches
      if (otp !== enteredOtp) {
        return { verified: false, error: 'Invalid OTP' };
      }
      
      // Mark as verified
      await updateDoc(otpDocRef, {
        verified: true,
        verifiedAt: new Date()
      });
      
      return { verified: true };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { verified: false, error: error.message };
    }
  }
  
  // Resend OTP
  async function resendOTP(userId) {
    try {
      // Get user email from existing OTP document
      const otpDocRef = doc(db, 'otpVerifications', userId);
      const otpDoc = await getDoc(otpDocRef);
      
      if (!otpDoc.exists()) {
        return { success: false, error: 'No verification record found' };
      }
      
      const { email } = otpDoc.data();
      const otp = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5); // Expires in 5 minutes
      
      // Update OTP document with new OTP
      await updateDoc(otpDocRef, {
        otp,
        createdAt: new Date(),
        expiresAt,
        emailSent: false,
        verified: false
      });
      
      // Send new OTP via email
      const response = await fetch(`${API_URL}/api/send-otp-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, userId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await updateDoc(otpDocRef, {
          emailSent: true,
          emailSentAt: new Date()
        });
        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Sign up new user
  async function signup(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile
      await setDoc(doc(db, 'users', user.uid), {
        email,
        createdAt: serverTimestamp(),
        isEmailVerified: false
      });
      
      // Create and send OTP
      const otpResult = await createOtpVerification(user.uid, email);
      
      return { 
        success: true, 
        user, 
        otpSent: otpResult.success,
        otp: otpResult.otp // Only for development purposes
      };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Login existing user
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Logout user
  async function logout() {
    return signOut(auth);
  }
  
  // Reset password
  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Mark user email as verified
  async function markEmailAsVerified(userId) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking email as verified:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Auth state change listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    createOtpVerification,
    verifyOTP,
    resendOTP,
    markEmailAsVerified
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}