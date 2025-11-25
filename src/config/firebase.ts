// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDiumkATE7zvJoygX8VIXWfc60caWwrTzc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "edenred-a6b0deed.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "edenred-a6b0deed",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "edenred-a6b0deed.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "268452910585",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:268452910585:web:cef59106404279094bd928",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZDVMNX0MNR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
