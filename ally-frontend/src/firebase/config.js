import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // 1. Import this
import { getAuth } from "firebase/auth";
import { getAnalytics, initializeAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAEND7pyI9eybjGxaMFwb1TuoxNOskdQKE",
  authDomain: "ally-45698.firebaseapp.com",
  databaseURL: "https://ally-45698-default-rtdb.firebaseio.com",
  projectId: "ally-45698",
  storageBucket: "ally-45698.firebasestorage.app",
  messagingSenderId: "269454537432",
  appId: "1:269454537432:web:914f23018650286236ddad",
  measurementId: "G-N9RJWEG8N7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig); // Export 'app' so other files can use it if needed
// Export Services
export const db = getFirestore(app);      // Keeps your existing Firestore working
export const database = getDatabase(app); // 3. Exports the new Realtime Database
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);