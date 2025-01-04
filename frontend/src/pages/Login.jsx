// src/pages/Login.jsx

import { useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Sign in the user with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;
      console.log("User logged in successfully:", user);

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        console.log("User role:", userRole);

        // Navigate based on user role
        if (userRole === "student") {
          navigate("/timer");
        } else if (userRole === "parent") {
          navigate("/parent-dashboard");
        } else if (userRole === "admin") {
          navigate("/admin-dashboard");
        }
      }

      toast.success("Logged in successfully!");
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Failed to log in. Please check your credentials.", `Error: ${error.message}`);

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
