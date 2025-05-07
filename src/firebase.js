// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
// Use the hardcoded values as fallback if environment variables are not available
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDG-9jWkzcqzky4aKDLzb6cEWC_xbQtPH4",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "daily-journal-fc04c.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "daily-journal-fc04c",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "daily-journal-fc04c.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "763391968519",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:763391968519:web:1b5dae641c0346880671a2",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-H3T8QKSC7E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics in non-SSR environments
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

export default app;