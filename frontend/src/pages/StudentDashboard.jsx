import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import { signOut } from 'firebase/auth';
import StDashHeader from '../components/Header/StudentDheader';
import AbsentTimesCard from '../components/AbsentTimesCard';
import EngagementChart from '../components/EngagementChart';
import SidePanel from '../components/SidePanel';

const mockData = {
  user: {
    name: "Alex Johnnson",
    email: "alex.j@university.edu",
    studentId: "STU2024125"
  },
  tasks: {
    completed: 24,
    inProgress: 8,
    total: 35
  },
  
};

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

const StudentDashboard = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [completedPomodoros, setCompletedPomodoros] = useState(null);
   const [userId, setUserId] = useState(null);

   useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Set the user ID when authenticated
      } else {
        console.error("User is not logged in!");
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user details
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

  // Fetch completed pomodoros
  const fetchCompletedPomodoros = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log('Fetched user data:', userData);
        setCompletedPomodoros(userData.completedPomodoros || 0);
      } else {
        console.error('No such document!');
      }
    } catch (error) {
      console.error('Error fetching pomodoro data:', error);
    }
  };

  const completedSessions = completedPomodoros !== null
    ? Math.floor(completedPomodoros / 2)
    : 0;
  // Use `onAuthStateChanged` to get the logged-in user's ID
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const userId = user.uid;
        console.log('Logged in user ID:', userId);

        // Fetch data based on the user ID
        fetchUserData(userId);
        fetchCompletedPomodoros(userId);
      } else {
        console.error('User is not logged in!');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out successfully');
      window.location.href = '/';
    } catch (error) {
      toast.error(error.message);
    }
  };
  const sidePanelStyle = {
    position: 'fixed', // Fixes the panel position
    left: -10,
    top: '300px',
        }


  return (
    <div className="min-h-screen bg-white">
      <div style={sidePanelStyle}>
        <SidePanel/>
      </div>
      <StDashHeader userDetails={userDetails}/>
      <div className='p-40'>
      <div className="flex justify-between items-center mb-8">
        
        {/* <button
          onClick={handleLogout}
        
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <LogOut size={20} />
        
        </button> */}
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  {/* Personal Details Section - Left Column */}
  <DashboardCard title="Personal Details">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-black">Name</p>
        <p className="font-medium">{userDetails?.name}</p>
      </div>
      <div>
        <p className="text-black">Email</p>
        <p className="font-medium">{userDetails?.email}</p>
      </div>
      <div>
      <p className="text-black">Student ID</p>
      <p className="font-medium">{userDetails?.studentId}</p>
      </div>
      
    </div>
  </DashboardCard>

  {/* Stats Grid - Right Column */}
<div className="flex gap-6">
  {/* Task Progress Card */}
  <DashboardCard title="Task Progress" className="flex-1">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-green-100 rounded-full">
        <CheckCircle className="text-green-600" size={24} />
      </div>
      <div>
        <p className="text-2xl font-bold text-black">{mockData.tasks.completed}/{mockData.tasks.total}</p>
        <p className="text-black">Tasks Completed</p>
      </div>
    </div>
  </DashboardCard>

  {/* Pomodoro Sessions Card */}
  <DashboardCard title="Pomodoro Sessions" className="flex-1">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-blue-100 rounded-full">
        <Clock className="text-blue-600" size={24} />
      </div>
      <div>
        <p className="text-2xl font-bold text-black">
          {completedPomodoros !== null ? completedSessions : 'Loading...'}
        </p>
        <p className="text-black">Total Completed Pomodoros</p>
      </div>
    </div>
  </DashboardCard>
</div>

</div>

{/* Weekly Progress Chart */}
<DashboardCard className='mt-15'>

  <EngagementChart userId={userId}/>
</DashboardCard>

<div className='mt-20'>
<h3 className="text-lg font-semibold mb-4 text-gray-800">
        We noticed you are not focused on studying in these times... 🧐
      </h3>
<AbsentTimesCard userId={userId} />
</div>

      </div>
    </div>
  );
};

export default StudentDashboard;
