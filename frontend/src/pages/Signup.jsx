import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, query, where ,doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const SignUp = () => {
  const { role } = useParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [studentId, setStudentId] = useState("");

  // Fields specific to students
  const [grade, setGrade] = useState("");

  const navigate = useNavigate();

  const generateUniqueId = async (db) => {
    let uniqueId;
    let isUnique = false;
  
    while (!isUnique) {
      uniqueId = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Query Firestore to check if the ID already exists
      const q = query(collection(db, "users"), where("studentId", "==", uniqueId));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        // No duplicate found, the ID is unique
        isUnique = true;
      }
    }
  
    return uniqueId;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Check if student exists using the entered studentId
      if (role === "parent") {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef, 
          where("studentId", "==", studentId), // Check if studentId matches
          where("role", "==", "student") // Ensure the role is "student"
        );
  
        const querySnapshot = await getDocs(q); // Execute the query
  
        if (querySnapshot.empty) {
          // Show alert if no student with this ID exists
          toast.error("Couldn't find any student with the Student ID you entered!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          navigate("/"); // Navigate to the home page
          return; // Exit function
        }
      }
  
      // Proceed with user creation if studentId exists for parent
      const userData = {
        uid: user.uid,
        name,
        email: user.email,
        role,
        gender,
        ...(role === "student" && { grade, school, studentId: uniqueId }),
        ...(role === "parent" && { studentId }),
      };
  
      await setDoc(doc(db, "users", user.uid), userData); // Save user data
  
      toast.success("User registered successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
  
      navigate("/login");
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error(`Error: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
    
  

  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full  max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Sign Up as {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
        <form onSubmit={handleSignUp} className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Name Field */}
  <div className="flex flex-col">
    <label htmlFor="name" className="font-semibold text-gray-700">Full Name</label>
    <input
      type="text"
      id="name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Full Name"
      required
      className="w-full p-2 border border-gray-300 rounded"
    />
  </div>

  {/* Email Field */}
  <div className="flex flex-col">
    <label htmlFor="email" className="font-semibold text-gray-700">Email</label>
    <input
      type="email"
      id="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Email"
      required
      className="w-full p-2 border border-gray-300 rounded"
    />
  </div>

  {/* Password Field */}
  <div className="flex flex-col">
    <label htmlFor="password" className="font-semibold text-gray-700">Password</label>
    <input
      type="password"
      id="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Password"
      required
      className="w-full p-2 border border-gray-300 rounded"
    />
  </div>

  {/* Gender Field */}
  <div className="flex flex-col">
    <label htmlFor="gender" className="font-semibold text-gray-700">Gender</label>
    <select
      id="gender"
      value={gender}
      onChange={(e) => setGender(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded"
    >
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>
  </div>

  {/* Role-specific Fields (Only for Students) */}
  {role === "student" && (
    <>
      {/* Grade Field */}
      <div className="flex flex-col">
        <label htmlFor="grade" className="font-semibold text-gray-700">Grade</label>
        <select
          id="grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Select Grade</option>
          <option value="6-9">Grade 6-9</option>
          <option value="10-11">Grade 10-11</option>
          <option value="12-13">Grade 12-13</option>
          <option value="university">University</option>
        </select>
      </div>
    </>
  )}

   {/* Role-specific Fields (Only for Parent) */}
   {role === "parent" && (
    <>
      {/* Child's Id Field */}
      <div className="flex flex-col">
        <label htmlFor="childsId" className="font-semibold text-gray-700">Child's Student ID</label>
        <input
      type="text"
      id="childsID"
      value={studentId}
      onChange={(e) => setStudentId(e.target.value)}
      placeholder="Enter Your Child's Student ID"
      required
      className="w-full p-2 border border-gray-300 rounded"
    />
      </div>
    </>
  )}

  {/* Submit Button */}
  <div className="col-span-2">
    <button
      type="submit"
      className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
    >
      Sign Up
    </button>
  </div>
</form>

      </div>
    </div>
  );
};

export default SignUp;
