// pages/PayPage.jsx
import React, { useEffect, useState } from 'react';
import PayPalButton from '../components/PaypalButton';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import PaypalButtons from '../components/PaypalButton';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';

const PayPage = () => {
  const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Set userId from the logged-in user
        setUserId(user.uid);
      } else {
        // No user is signed in
        setUserId(null);
      }
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, []);

  if (!userId) {
    return (
      <div>
        <p>You need to be logged in to make a payment.</p>
        {/* Redirect to login page or show login options */}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Unlock Quiz Access</h1>
        <p className="text-gray-600 mb-4">
          Pay just <span className="font-semibold text-black">$25</span> to access exclusive quizzes and track your performance.
        </p>
<PayPalScriptProvider>
      <PaypalButtons userId={userId}/>
      </PayPalScriptProvider>

        <p className="text-xs text-gray-400 mt-4">
          All payments are securely processed via PayPal Sandbox (test mode).
        </p>
      </div>
    </div>
  );
};

export default PayPage;
