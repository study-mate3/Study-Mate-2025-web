import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  Bell, 
  TrendingUp, 
  User, 
  MessageSquare,
  Search,
  Trash2
} from 'lucide-react';
import ComparisonGraphs from '../components/ComparisonGraph';
import { 
  ComposedChart, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { getAuth, signOut } from 'firebase/auth';
import { Navigate, useNavigate } from 'react-router-dom';

import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    message: '',
    recipientType: 'all',
    importance: 'normal'
  });
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsersToday, setNewUsersToday] = useState(0);
  const [genderDistribution, setGenderDistribution] = useState({ male: 0, female: 0 });
  const [totalParents, setTotalParents] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [users, setUsers] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    engagement: {
      activeParents: 0,
      activeStudents: 0,
      parentEngagementRate: '0%',
      studentEngagementRate: '0%',
    },
  });

  const [userGrowthData, setUserGrowthData] = useState([]); 
  const [dailyNewUsers, setDailyNewUsers] = useState([]);

  // Sample data with expanded user details
  {/*
  // Enhanced metrics with gender and engagement data
  const metrics = [
    { title: 'Total Users', value: '1,234', icon: Users, trend: '+12%' },
    { title: 'Active Now', value: '423', icon: Activity, trend: '+5%' },
    { title: 'New Today', value: '47', icon: TrendingUp, trend: '+8%' },
  ];
  */}

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
        // Filter out admins
        const nonAdminUsers = usersData.filter(user => user.role?.toLowerCase() !== 'admin');
  
        // Total Users (excluding admins)
        setTotalUsers(nonAdminUsers.length);

        // Total Users Over Time & Daily New Users
        const userCountByDate = {};
        const cumulativeUsers = {};
        let runningTotal = 0;

        // Sort by date to ensure chronological order
        nonAdminUsers.sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateA - dateB;
        });

        nonAdminUsers.forEach(user => {
          const createdDate = user.createdAt?.toDate().toISOString().split('T')[0];
          if (createdDate) {
            // For daily new users
            userCountByDate[createdDate] = (userCountByDate[createdDate] || 0) + 1;
            
            // For cumulative total
            runningTotal += 1;
            cumulativeUsers[createdDate] = runningTotal;
          }
        });

        // Get all dates in chronological order
        const allDates = Object.keys(userCountByDate).sort();
        
        // Create combined dataset for the charts
        const combinedUserData = allDates.map(date => ({
          date,
          newUsers: userCountByDate[date],
          totalUsers: cumulativeUsers[date]
        }));

        setUserGrowthData(combinedUserData);
        setDailyNewUsers(combinedUserData);

        // New Users Today
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const newUsersTodayCount = nonAdminUsers.filter(user => 
          user.createdAt && user.createdAt.toDate() >= startOfDay
        ).length;
        setNewUsersToday(newUsersTodayCount);
  
        // Gender Distribution
        const maleCount = nonAdminUsers.filter(user => user.gender && user.gender.toLowerCase() === 'male').length;
        const femaleCount = nonAdminUsers.filter(user => user.gender && user.gender.toLowerCase() === 'female').length;
        const unknownGenderCount = nonAdminUsers.length - maleCount - femaleCount;
        setGenderDistribution({ 
          male: maleCount, 
          female: femaleCount,
          unknown: unknownGenderCount
        });
  
        // Total Parents & Students
        const parentsCount = nonAdminUsers.filter(user => user.role?.toLowerCase() === 'parent').length;
        const studentsCount = nonAdminUsers.filter(user => user.role?.toLowerCase() === 'student').length;
        setTotalParents(parentsCount);
        setTotalStudents(studentsCount);
  
        // Active Parents & Students
        const activeParentsCount = nonAdminUsers.filter(user => 
          user.role?.toLowerCase() === 'parent' && user.status?.toLowerCase() === 'active'
        ).length;
        const activeStudentsCount = nonAdminUsers.filter(user => 
          user.role?.toLowerCase() === 'student' && user.status?.toLowerCase() === 'active'
        ).length;
  
        // Engagement Rates
        const parentEngagementRate = parentsCount > 0 ? `${Math.round((activeParentsCount / parentsCount) * 100)}%` : '0%';
        const studentEngagementRate = studentsCount > 0 ? `${Math.round((activeStudentsCount / studentsCount) * 100)}%` : '0%';
  
        // Update State
        setAnalyticsData({
          engagement: {
            activeParents: activeParentsCount,
            activeStudents: activeStudentsCount,
            parentEngagementRate,
            studentEngagementRate,
          },
        });
  
        // Store Non-Admin Users Data for the Table
        setUsers(nonAdminUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);
  

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);  // Sign out the user from Firebase

      // Clear local session (localStorage or cookies)
      localStorage.removeItem('userToken');
      localStorage.removeItem('username');
      
      // Redirect to home page or login page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Handle error (optional, show an error message to the user)
    }
  };

  const handleDeleteUser = (userId) => {
    alert(`Deleting user with ID: ${userId}`);
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    alert(`Notification sent: ${JSON.stringify(notification, null, 2)}`);
    setNotification({
      message: '',
      recipientType: 'all',
      importance: 'normal'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <ArrowLeftOnRectangleIcon
          className="h-8 w-8 text-cyan-700 hover:text-blue-950 hover:font-extrabold cursor-pointer"
          onClick={handleLogout} // Add click handler
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Combined Users Growth Chart - Takes 3/5 of the width */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-gray-800">User Growth Trends</h3>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={userGrowthData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                label={{ value: 'Date', position: 'insideBottomRight', offset: -5, fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left" 
                label={{ value: 'Total Users', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                label={{ value: 'New Users', angle: 90, position: 'insideRight', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  border: 'none' 
                }}
                formatter={(value, name) => {
                  if (name === "totalUsers") {
                    return [value, "Total Users"];
                  } else if (name === "newUsers") {
                    return [value, "New Users"];
                  }
                  return [value, name]; // Fallback
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Area 
                type="monotone" 
                dataKey="totalUsers" 
                fill="rgba(0, 136, 254, 0.2)" 
                stroke="#0088FE" 
                strokeWidth={2}
                yAxisId="left"
                name="Total Users"
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Bar 
                dataKey="newUsers" 
                fill="rgba(255, 128, 66, 0.8)" 
                yAxisId="right"
                name="New Users"
                animationDuration={1500}
                animationEasing="ease-in-out"
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Pie
                data={[
                  { name: 'Male', value: genderDistribution.male },
                  { name: 'Female', value: genderDistribution.female },
                  { name: 'Not Specified', value: genderDistribution.unknown }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={true}
              >
                <Cell fill="#0088FE" />
                <Cell fill="#FF6B8B" />
                <Cell fill="#AAAAAA" />
              </Pie>
              <Tooltip 
                formatter={(value, name) => [value, name]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  border: 'none'
                }}
              />
              <Legend layout="vertical" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-gray-800">User Role Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Pie
                data={[
                  { name: 'Parents', value: totalParents },
                  { name: 'Students', value: totalStudents }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                animationBegin={200}
                animationDuration={1200}
                animationEasing="ease-out"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={true}
              >
                <Cell fill="#36B37E" />
                <Cell fill="#FFAB00" />
              </Pie>
              <Tooltip 
                formatter={(value, name) => [value, name]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  border: 'none'
                }}
              />
              <Legend layout="vertical" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
  
      {/* Basic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <Users className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold">{totalUsers}</h3>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium text-gray-500">New Today</p>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold">{newUsersToday}</h3>
          </div>
        </div>
      </div>
  
      {/* Gender Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Gender Distribution</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Male</p>
            <p className="text-2xl font-bold">{genderDistribution.male}%</p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm font-medium text-gray-500">Female</p>
            <p className="text-2xl font-bold">{genderDistribution.female}%</p>
          </div>
        </div>
  
        {/* User Engagement */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">User Engagement</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Parents */}
            <div className="border-r pr-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Total Parents</p>
                <p className="text-2xl font-bold">{totalParents}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Active Parents</p>
                <p className="text-2xl font-bold">{analyticsData.engagement.activeParents}</p>
                <p className="text-sm text-green-500">Engagement: {analyticsData.engagement.parentEngagementRate}</p>
              </div>
            </div>

            {/* Students */}
            <div className="pl-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Active Students</p>
                <p className="text-2xl font-bold">{analyticsData.engagement.activeStudents}</p>
                <p className="text-sm text-green-500">Engagement: {analyticsData.engagement.studentEngagementRate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.gender}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>{user.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
  
        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Send Notification</h2>
          <form onSubmit={handleNotificationSubmit} className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                rows="4"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring focus:ring-blue-500 focus:border-blue-500"
                value={notification.message}
                onChange={(e) => setNotification({ ...notification, message: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="recipientType" className="block text-sm font-medium text-gray-700">
                Recipient Type
              </label>
              <select
                id="recipientType"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring focus:ring-blue-500 focus:border-blue-500"
                value={notification.recipientType}
                onChange={(e) => setNotification({ ...notification, recipientType: e.target.value })}
              >
                <option value="all">All Users</option>
                <option value="students">Students</option>
                <option value="parents">Parents</option>
              </select>
            </div>
            <div>
              <label htmlFor="importance" className="block text-sm font-medium text-gray-700">
                Importance
              </label>
              <select
                id="importance"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring focus:ring-blue-500 focus:border-blue-500"
                value={notification.importance}
                onChange={(e) => setNotification({ ...notification, importance: e.target.value })}
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
            >
              Send Notification
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
