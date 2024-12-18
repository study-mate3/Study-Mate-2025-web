import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, BookOpen, CheckCircle, ChevronDown, Calendar, LogOut } from 'lucide-react';

// Sample data - replace with your actual data
const studyData = [
  { date: '2024-10-22', hours: 3.5, tasksCompleted: 8, subjects: ['Math', 'Science'] },
  { date: '2024-10-23', hours: 2.8, tasksCompleted: 6, subjects: ['English', 'History'] },
  { date: '2024-10-24', hours: 4.2, tasksCompleted: 10, subjects: ['Math', 'Science', 'English'] },
  { date: '2024-10-25', hours: 3.0, tasksCompleted: 7, subjects: ['Geography', 'Math'] },
  { date: '2024-10-26', hours: 3.7, tasksCompleted: 9, subjects: ['Science', 'History'] },
  { date: '2024-10-27', hours: 2.5, tasksCompleted: 5, subjects: ['English'] },
  { date: '2024-10-28', hours: 4.0, tasksCompleted: 11, subjects: ['Math', 'Science', 'History'] },
];

const weeklyStats = {
  totalHours: studyData.reduce((acc, day) => acc + day.hours, 0),
  totalTasks: studyData.reduce((acc, day) => acc + day.tasksCompleted, 0),
  averageHours: (studyData.reduce((acc, day) => acc + day.hours, 0) / studyData.length).toFixed(1),
  mostStudiedSubject: 'Math'
};

export default function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState('Alex');
  const [timeRange, setTimeRange] = useState('week');

  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  const handleLogout = () => {
    console.log('Logging out...');
    // Add your logout logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-gray-800">Parent Dashboard</h1>
          <p className="text-gray-600">Monitor your child's study progress</p>
        </div>

        {/* Child Selector */}
        <div className="relative mr-2">
          <select 
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Alex">Alex</option>
            <option value="Emma">Emma</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-500" />
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


      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Study Hours</p>
              <p className="text-2xl font-bold text-gray-800">{weeklyStats.totalHours}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-800">{weeklyStats.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Most Studied Subject</p>
              <p className="text-2xl font-bold text-gray-800">{weeklyStats.mostStudiedSubject}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Average Daily Hours</p>
              <p className="text-2xl font-bold text-gray-800">{weeklyStats.averageHours}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Study Hours Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Daily Study Hours</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={studyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks Completed Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Daily Tasks Completed</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasksCompleted" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {studyData.slice(0, 5).map((day, index) => (
            <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <p className="text-gray-800 font-medium">{day.date}</p>
                <p className="text-gray-600 text-sm">Studied: {day.subjects.join(', ')}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-800 font-medium">{day.hours} hours</p>
                <p className="text-gray-600 text-sm">{day.tasksCompleted} tasks completed</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}