// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Replace with your Firebase config from the Firebase console
const firebaseConfig = {
    apiKey: "AIzaSyDG-9jWkzcqzky4aKDLzb6cEWC_xbQtPH4",
    authDomain: "daily-journal-fc04c.firebaseapp.com",
    projectId: "daily-journal-fc04c",
    storageBucket: "daily-journal-fc04c.firebasestorage.app",
    messagingSenderId: "763391968519",
    appId: "1:763391968519:web:1b5dae641c0346880671a2",
    measurementId: "G-H3T8QKSC7E"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;