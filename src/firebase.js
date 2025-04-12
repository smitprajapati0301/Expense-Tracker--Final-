// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAm9XqQ6SAC6Az8gAqAo2EqB4FRAwcylPQ",
  authDomain: "expense-tracker-26ae9.firebaseapp.com",
  projectId: "expense-tracker-26ae9",
  storageBucket: "expense-tracker-26ae9.appspot.com",   // small fix
  messagingSenderId: "268175840211",
  appId: "1:268175840211:web:94cc20778bec96ba979526",
  measurementId: "G-2PH8SG1QFF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
