// Fix: Import firebase v8 compatibility packages.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// WARNING: It is strongly recommended to use environment variables for Firebase credentials in a real application.
// Do not commit this file with real credentials to a public repository.
const firebaseConfig = {
  apiKey: "AIzaSyD-Si_1X2RxIFHp5AyXJn6_Fx1wDLOb5qQ",
  authDomain: "app-chi-b0639.firebaseapp.com",
  projectId: "app-chi-b0639",
  storageBucket: "app-chi-b0639.firebasestorage.app",
  messagingSenderId: "126401298500",
  appId: "1:126401298500:web:6d8010b85c90dc7451fc11",
  measurementId: "G-V3XDT9JQKT"
};


// Initialize Firebase
// Fix: Use v8 namespaced API for initialization.
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
// Fix: Use v8 namespaced API to get auth and firestore instances.
const auth = firebase.auth();
const db = firebase.firestore();

export { app, auth, db };