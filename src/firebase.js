// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyBwFqlsotHrNTt1yMdYE7IhNkK3WRANeEs',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'thejaslink-8c5a0.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'thejaslink-8c5a0',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'thejaslink-8c5a0.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '12854836356',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:12854836356:web:cc1221fb9a3f98392ad6d1',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Optional: Initialize Analytics only if supported and in production
export let analytics = null;
export let performance = null;

if (typeof window !== 'undefined') {
  // Initialize Analytics
  isSupported().then(supported => {
    if (supported && process.env.NODE_ENV === 'production') {
      analytics = getAnalytics(app);
    }
  }).catch(console.error);

  // Initialize Performance Monitoring
  try {
    performance = getPerformance(app);
  } catch (error) {
    console.warn('Firebase Performance not supported:', error);
  }

  // Enable offline persistence for Firestore
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser doesn\'t support persistence.');
    }
  });

  // Set authentication persistence
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

// Firebase error codes for easier handling
export const FIREBASE_ERRORS = {
  'auth/user-not-found': 'No user found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'permission-denied': 'You do not have permission to perform this action.'
};

export default app;