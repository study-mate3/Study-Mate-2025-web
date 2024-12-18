// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function that also sets the role in Firestore
  const signup = async (email, password, role) => {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Save the user role in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: role,
    });

    setCurrentUser(user);
    setRole(role);
  };

  // Login function
  const login = async (email, password) => {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
  
    const userDoc = await getDoc(doc(db, 'users', user.uid));
  
    if (userDoc.exists()) {
      const userRole = userDoc.data().role;
      console.log("User role retrieved:", userRole);  // Debug line
      setRole(userRole);
      setCurrentUser(user);
  
      if (userRole === 'student') {
        navigate('/timer');
      } else if (userRole === 'parent') {
        navigate('/parent-dashboard');
      }
    }
  };
  

  // Logout function
  const logout = () => {
    setRole(null);
    return auth.signOut();
  };

  // Fetch user role from Firestore when they log in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setRole(userDoc.exists() ? userDoc.data().role : null);
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    role,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
