import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyASE0hSsbCkHebZoI64cVvmOB0E3cTnGFc",
  authDomain: "cloud-tasks-8b225.firebaseapp.com",
  projectId: "cloud-tasks-8b225",
  databaseURL: "https://cloud-tasks-8b225-default-rtdb.firebaseio.com/",
  storageBucket: "cloud-tasks-8b225.appspot.com", // Fixed URL for the storage bucket
  messagingSenderId: "1096817042535",
  appId: "1:1096817042535:web:5fb410038b335e8a2fa0c2",
  measurementId: "G-ZY0M6H1RXZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);
export const auth = getAuth(app); // Export the initialized auth once

export const messaging = getMessaging(app);
export { database, firestore };
