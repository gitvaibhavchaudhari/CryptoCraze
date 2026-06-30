import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBiUZ1a0KuYEpBMfropppcP0GdzWH2Hi-M",
  authDomain: "cryptocraze-3c733.firebaseapp.com",
  projectId: "cryptocraze-3c733",
  storageBucket: "cryptocraze-3c733.firebasestorage.app",
  messagingSenderId: "1057972056185",
  appId: "1:1057972056185:web:14bcdd1301a4c74fce24a8"
};

const app = initializeApp(firebaseConfig);

// 👇 ADD THESE
export const auth = getAuth(app);
export const db = getFirestore(app);