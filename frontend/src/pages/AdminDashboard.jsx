import React, { useState } from 'react';
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

const AdminDashboard = () => {
  const [notification, setNotification] = useState({
    message: '',
    recipientType: 'all',
    importance: 'normal'
  });

  // Sample data with expanded user details
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', lastLogin: '2024-10-26', type: 'Student', gender: 'Male' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive', lastLogin: '2024-10-25', type: 'Parent', gender: 'Female' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active', lastLogin: '2024-10-27', type: 'Student', gender: 'Male' },
  ];

  // Enhanced metrics with gender and engagement data
  const metrics = [
    { title: 'Total Users', value: '1,234', icon: Users, trend: '+12%' },
    { title: 'Active Now', value: '423', icon: Activity, trend: '+5%' },
    { title: 'New Today', value: '47', icon: TrendingUp, trend: '+8%' },
  ];

  // Analytics data
  const analyticsData = {
    genderDistribution: {
      male: 58,
      female: 42
    },
    engagement: {
      totalParents: 520,
      totalStudents: 870,
      activeParents: 456,
      activeStudents: 789,
      parentEngagementRate: '75%',
      studentEngagementRate: '85%'
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
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium">Admin</span>
          </div>
        </div>
      </div>

      {/* Basic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                <Icon className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold">{metric.value}</h3>
                <span className="text-green-500 text-sm">{metric.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gender Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Gender Distribution</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Male</p>
            <p className="text-2xl font-bold">{analyticsData.genderDistribution.male}%</p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm font-medium text-gray-500">Female</p>
            <p className="text-2xl font-bold">{analyticsData.genderDistribution.female}%</p>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">User Engagement</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-r pr-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Total Parents</p>
                <p className="text-2xl font-bold">{analyticsData.engagement.totalParents}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Active Parents</p>
                <p className="text-2xl font-bold">{analyticsData.engagement.activeParents}</p>
                <p className="text-sm text-green-500">Engagement: {analyticsData.engagement.parentEngagementRate}</p>
              </div>
            </div>
            <div className="pl-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold">{analyticsData.engagement.totalStudents}</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.type}</td>
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
