import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, query, where,collection,getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import { signOut } from 'firebase/auth';
import StDashHeader from '../components/Header/StudentDheader';
import AbsentTimesCard from '../components/AbsentTimesCard';
import EngagementChart from '../components/EngagementChart';
import StudentDetailsPage from '../components/StudentDetails';
import ParentSidePanel from '../components/ParentSidePanel';


const DashboardCard = ({ userId, title, children, className = '' }) => (
  <div
    className={`p-6 ${className}`}
    style={{
      background: 'white',
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      borderRadius: 10,
      border: '0.02px solid rgba(154, 157, 161, 0.38)',
    }}
  >
    <h3 className="text-lg font-semibold mb-4 text-black">{title}</h3>
    {children}
  </div>
);

const ParentDashboard = () => {
  const [parentName, setParentName] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [completedPomodoros, setCompletedPomodoros] = useState(null);
  const [userId, setUserId] = useState(null);
  
  // Fetch parent name and student data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Set the user ID when authenticated
        fetchUserData(user.uid); // Fetch parent data
        
      } else {
        console.error("User is not logged in!");
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch parent's name
  const fetchUserData = async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
        console.log('User details:', docSnap.data());
      } else {
        console.error('No such document!');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(error.message);
    }
  };

  

  // Fetch student's data based on studentId


  // Fetch completed pomodoros
  

  
  const sidePanelStyle = {
    position: 'fixed', // Fixes the panel position
    left: -10,
    top: '300px',
        }


  return (
    <div className="min-h-screen bg-white">
       <div style={sidePanelStyle}>
        <ParentSidePanel/>
      </div> 
      <StDashHeader userDetails={userDetails}/>
      <div className="px-4 sm:px-6 lg:px-12 xl:px-24 pt-24 lg:pt-10">
      <div className="flex justify-between items-center mb-8">
        <StudentDetailsPage/> 
        
        {/* <button
          onClick={handleLogout}
        
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <LogOut size={20} />
        
        </button> */}
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
 

</div>

</div>



      </div>
  );
};

export default ParentDashboard;