import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration (from your project)
const firebaseConfig = {
  apiKey: 'AIzaSyBwFqlsotHrNTt1yMdYE7IhNkK3WRANeEs',
  authDomain: 'thejaslink-8c5a0.firebaseapp.com',
  projectId: 'thejaslink-8c5a0',
  storageBucket: 'thejaslink-8c5a0.appspot.com',
  messagingSenderId: '12854836356',
  appId: '1:12854836356:web:cc1221fb9a3f98392ad6d1'
  // measurementId is optional for analytics and not required for Auth/Firestore
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


