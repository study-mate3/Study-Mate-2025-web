import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import { signOut } from 'firebase/auth';

const mockData = {
  user: {
    name: "Alex Johnson",
    email: "alex.j@university.edu",
    studentId: "STU2024125"
  },
  tasks: {
    completed: 24,
    inProgress: 8,
    total: 35
  },
  pomodoros: {
    totalSessions: 45,
    totalHours: 90,
    weeklyData: [
      { day: 'Mon', sessions: 4 },
      { day: 'Tue', sessions: 6 },
      { day: 'Wed', sessions: 3 },
      { day: 'Thu', sessions: 7 },
      { day: 'Fri', sessions: 5 },
      { day: 'Sat', sessions: 2 },
      { day: 'Sun', sessions: 4 }
    ]
  }
};

const DashboardCard = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-lg p-6 shadow-lg ${className}`}>
    <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
    {children}
  </div>
);

const StudentDashboard = () => {
  const [userDetails, setUserDetails] = useState(null);

  const fetchUserData = async () => {
    try {
      auth.onAuthStateChanged(async(user) => {
        console.log(user);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          console.log(docSnap.data())
        }else{
          console.log("User is not logged in");
        }
      })
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchUserData();
  },[]);

  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = '/login';
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {userDetails?.name}</p>
        </div>
        <button
          onClick={handleLogout}
          onMouseEnter={() => setIsLogoutHovered(true)}
          onMouseLeave={() => setIsLogoutHovered(false)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <LogOut size={20} />
          {isLogoutHovered && "Logout"}
        </button>
      </div>

      {/* Profile Card */}
      <DashboardCard title="Personal Details" className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-medium">{userDetails?.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{userDetails?.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Student ID</p>
            <p className="font-medium">{mockData.user.studentId}</p>
          </div>
        </div>
      </DashboardCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <DashboardCard title="Task Progress">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{mockData.tasks.completed}/{mockData.tasks.total}</p>
              <p className="text-gray-600">Tasks Completed</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Pomodoro Sessions">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{mockData.pomodoros.totalSessions}</p>
              <p className="text-gray-600">Total Sessions</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Study Hours">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{mockData.pomodoros.totalHours}</p>
              <p className="text-gray-600">Total Hours</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Weekly Progress Chart */}
      <DashboardCard title="Weekly Pomodoro Sessions">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData.pomodoros.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>
    </div>
  );
};

export default StudentDashboard;