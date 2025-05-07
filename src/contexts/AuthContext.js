import { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  updateProfile
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
      
      // Provide more user-friendly error messages
      let errorMessage;
      switch(error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many unsuccessful login attempts. Please try again later or reset your password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        default:
          errorMessage = error.message || 'An error occurred during login. Please try again.';
      }
      
      return { success: false, error: errorMessage, code: error.code };
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

  // Send verification email
  async function sendVerificationEmail() {
    try {
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
        return { success: true };
      } else {
        return { success: false, error: 'User already verified or not logged in' };
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user profile
  async function updateUserProfile(displayName, photoURL) {
    try {
      if (!currentUser) {
        return { success: false, error: 'No user is logged in' };
      }
      
      const updates = {};
      if (displayName) updates.displayName = displayName;
      if (photoURL) updates.photoURL = photoURL;
      
      await updateProfile(currentUser, updates);
      
      // Update the user document in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...displayName && { displayName },
        ...photoURL && { photoURL },
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Delete user account
  async function deleteUserAccount() {
    try {
      if (!currentUser) {
        return { success: false, error: 'No user is logged in' };
      }
      
      // Delete user from Firebase Auth
      await deleteUser(currentUser);
      return { success: true };
    } catch (error) {
      console.error('Error deleting user account:', error);
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
    markEmailAsVerified,
    sendVerificationEmail,
    updateUserProfile,
    deleteUserAccount
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}