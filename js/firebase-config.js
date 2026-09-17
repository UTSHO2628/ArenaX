import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// TODO: Replace this configuration with your Firebase project settings
// Note: It is safe to expose these keys in a public web app. Access is controlled by the Firestore Security Rules.
const firebaseConfig = {
  apiKey: "AIzaSyAmH_8m2Qz1BEFO_MeA1CsiJts0CRcuGwc",
  authDomain: "arenax-c3b00.firebaseapp.com",
  projectId: "arenax-c3b00",
  storageBucket: "arenax-c3b00.firebasestorage.app",
  messagingSenderId: "243911135436",
  appId: "1:243911135436:web:a1850cb5ba7288b6cbb269",
  measurementId: "G-GBG9TCYL69"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
