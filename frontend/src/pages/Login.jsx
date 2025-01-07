// src/pages/Login.jsx
import React, { useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import logo2 from '../assets/images/HomePageIcons/scrolledLogo.png'
import Alert from "../components/Alert";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);



  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Sign in the user with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in successfully:", userCredential.user);
      setAlertMessage("User logged in successfully!");
      setShowAlert(true);
  
      // Get user data from Firestore based on the logged-in user
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check role and navigate accordingly
        if (userData.role === "student") {
          navigate('/timer'); // Navigate to the timer page for students

        }else if (userData.role === "admin") {
          navigate('/admin-dashboard'); // Navigate to the timer page for students

        } else if (userData.role === "parent") {
          navigate('/parent-dashboard'); // Navigate to parent's dashboard with the studentId
        }
      } else {
        console.error("No user document found!");
        toast.error("User data not found in Firestore.");
        setAlertMessage("No user document found!");
        setShowAlert(true);
    
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(`Error: ${error.message}`);
      setAlertMessage(`Error: ${error.message}`);
      setShowAlert(true);
  
    }
  };
  

  return (
<div className="flex justify-center items-center min-h-screen bg-gray-100 bg-[url('./assets/images/HomePageIcons/loginbg.jpeg')] bg-cover bg-center">
{showAlert && <Alert message={alertMessage} onClose={() => setShowAlert(false)} />}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <div className="flex justify-center items-center">
      <img src={logo2} alt="Logo" className="w-[140px] h-auto pb-4" />
      </div>

      <h2 className="text-2xl font-bold mb-8 flex justify-center items-center">Log in to your Account</h2>
        <form onSubmit={handleLogin} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="email" className="font-semibold text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Your Email"
            required
            className="w-full p-2 bg-[#bfd8fd] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="password" className="font-semibold text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Your Password"
            required
            className="w-full p-2 bg-[#bfd8fd] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
          />
        </div>

        <button
          type="submit"
          className="w-full  text-white font-semibold text-[16px] h-[30px] bg-gradient-to-b from-[#0570b2] to-[#0745a2] rounded-[100px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
        >
          Log In
        </button>
      </form>

        <p className="mt-4 text-center">
          Don’t have an account?{" "}
          <Link to="/role" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
