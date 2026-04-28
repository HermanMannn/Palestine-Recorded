import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCi1MBPIK5sEDofy6tKxEEHv3vIbSrf-gM",
  authDomain: "palrec-4ce7a.firebaseapp.com",
  databaseURL: "https://palrec-4ce7a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "palrec-4ce7a",
  storageBucket: "palrec-4ce7a.firebasestorage.app",
  messagingSenderId: "368811560507",
  appId: "1:368811560507:web:8852e2d564a2483cb0961e",
  measurementId: "G-QP21JCHXH9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);