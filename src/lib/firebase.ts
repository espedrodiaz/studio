// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABzDx_YWs2I6id7Wl-er3NSAi5laP9Fjs",
  authDomain: "facilitoposvzla.firebaseapp.com",
  projectId: "facilitoposvzla",
  storageBucket: "facilitoposvzla.firebasestorage.app",
  messagingSenderId: "980965995563",
  appId: "1:980965995563:web:00bbafb002c25a919fe66e"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
