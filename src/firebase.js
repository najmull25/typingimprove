import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCvsnOM1-iWEOjSB5J-hdQtpqajJ9qqEUQ",
  authDomain: "typingbd-645fc.firebaseapp.com",
  projectId: "typingbd-645fc",
  storageBucket: "typingbd-645fc.firebasestorage.app",
  messagingSenderId: "1022750951571",
  appId: "1:1022750951571:web:a52e4b118903a321a72566",
  measurementId: "G-YESYZRQL5G"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
