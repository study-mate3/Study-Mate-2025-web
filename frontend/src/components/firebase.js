// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASF3ARrhbBxGlpr241gqJwTWi4lJThuII",
  authDomain: "study-mate-2024.firebaseapp.com",
  projectId: "study-mate-2024",
  storageBucket: "study-mate-2024.appspot.com",
  messagingSenderId: "498657514234",
  appId: "1:498657514234:web:4fdfdc9ec150b8cc51af43",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
