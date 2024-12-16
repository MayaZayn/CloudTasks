import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyChgEcmw0IC2e16QgRNDTGg3--op7Tulgg",
  authDomain: "cloudtasks-78a35.firebaseapp.com",
  databaseURL: "https://cloudtasks-78a35-default-rtdb.firebaseio.com",
  projectId: "cloudtasks-78a35",
  storageBucket: "cloudtasks-78a35.firebasestorage.app",
  messagingSenderId: "574895120284",
  appId: "1:574895120284:web:c62e7b95ee79fcb2653259",
  measurementId: "G-N22RFB552B"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);
export const auth = getAuth(app); // Export the initialized auth once

export const messaging = getMessaging(app);
export { database, firestore };
