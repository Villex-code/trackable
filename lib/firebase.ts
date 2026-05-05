import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC3hxeHvCpTIKZM6603Yb1uz_uVlnAxszo",
  authDomain: "trackable-8876e.firebaseapp.com",
  projectId: "trackable-8876e",
  storageBucket: "trackable-8876e.firebasestorage.app",
  messagingSenderId: "279949951243",
  appId: "1:279949951243:web:8a200baf711c630797620e",
  measurementId: "G-C8VY5T91K3"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
