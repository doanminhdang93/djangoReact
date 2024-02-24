// config.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAFjC23xCakh8tglqbx1eD2tNPf6hoDniU",
  authDomain: "fitnesstracker-26a8b.firebaseapp.com",
  projectId: "fitnesstracker-26a8b",
  storageBucket: "fitnesstracker-26a8b.appspot.com",
  messagingSenderId: "548701175780",
  appId: "1:548701175780:web:a24012ea461468a7bf91f1",
  measurementId: "G-YZ0N33JWY9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);

export const API_URL = "http://127.0.0.1:8080";
