
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBibQvY7gZ7mYxG1a7e4J_Vv91y0Gf_qxU",
  authDomain: "facilitoposvzla.firebaseapp.com",
  projectId: "facilitoposvzla",
  storageBucket: "facilitoposvzla.appspot.com",
  messagingSenderId: "980965995563",
  appId: "1:980965995563:web:00bbafb002c25a919fe66e"
};

// Robust Firebase initialization
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence only on the client-side
if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence);
}

export { app, auth, db };
