import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Fix the import path
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions directly
import { db } from '../../firebase'; // Fix the import path

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const { currentUser, verifyOTP, resendOTP, markEmailAsVerified } = useAuth();
  const navigate = useNavigate();
  
  // Get current OTP from Firestore for development purposes
  useEffect(() => {
    const fetchCurrentOtp = async () => {
      if (currentUser) {
        try {
          const otpDocRef = doc(db, 'otpVerifications', currentUser.uid);
          const otpDoc = await getDoc(otpDocRef);
          
          if (otpDoc.exists()) {
            const { otp } = otpDoc.data();
            console.log('Current OTP:', otp); // Only for development
          }
        } catch (error) {
          console.error('Error fetching OTP:', error);
        }
      }
    };
    
    fetchCurrentOtp();
  }, [currentUser]);
  
  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      const result = await verifyOTP(currentUser.uid, otp);
      
      if (result.verified) {
        setMessage('Email verified successfully!');
        await markEmailAsVerified(currentUser.uid);
        // Redirect after successful verification
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(result.error || 'Failed to verify OTP');
      }
    } catch (error) {
      setError('Failed to verify code: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
  
  // Handle resend OTP
  async function handleResendOTP() {
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      const result = await resendOTP(currentUser.uid);
      
      if (result.success) {
        setMessage('New verification code sent!');
        setTimeLeft(300); // Reset timer to 5 minutes
      } else {
        setError(result.error || 'Failed to resend verification code');
      }
    } catch (error) {
      setError('Failed to resend code: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Verify Your Email</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}
      
      <p className="mb-4 text-gray-700">
        We've sent a verification code to your email address. Please enter it below to verify your account.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
          />
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Didn't receive the code? {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : ''}
        </p>
        <button
          onClick={handleResendOTP}
          disabled={loading || timeLeft > 0}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium disabled:opacity-50"
        >
          Resend Code
        </button>
      </div>
    </div>
  );
}