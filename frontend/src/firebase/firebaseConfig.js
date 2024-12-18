// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCSvJebFUaE2JhSnuExSKkL-8iZ4jjfnkc",
    authDomain: "studymate2-3b3b0.firebaseapp.com",
    projectId: "studymate2-3b3b0",
    storageBucket: "studymate2-3b3b0.appspot.com",
    messagingSenderId: "1098732923567",
    appId: "1:1098732923567:web:a467db948b126dc5ef425a"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;