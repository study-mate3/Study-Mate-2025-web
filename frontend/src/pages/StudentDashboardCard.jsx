import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import to get URL params
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { Clock } from 'lucide-react';
import CountUp from 'react-countup';
import StDashHeader from '../components/Header/StudentDheader';
import SidePanel from '../components/SidePanel';
import RewardComponent from '../components/Rewards/RewardComponent';
import LastSessionSummary from '../components/LastSessionSummary';
import EngagementChart from '../components/EngagementChart';

const DashboardCard = ({ title, children, className = '' }) => (
  <div className={`p-6 ${className}`} style={{
    background: 'white',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    borderRadius: 10,
    border: '0.02px solid rgba(154, 157, 161, 0.38)',
  }}>
    <h3 className="text-lg font-semibold mb-4 text-black">{title}</h3>
    {children}
  </div>
);

const StudentDashboardCard = () => {
  const { studentId } = useParams(); // Get studentId from URL
  const [userDetails, setUserDetails] = useState(null);
  const [completedPomodoros, setCompletedPomodoros] = useState(null);
  const [initialTime, setInitialTime] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchUserData(studentId);
      fetchCompletedPomodoros(studentId);
      fetchPomodoroTime(studentId);
    }
  }, [studentId]);

  const fetchUserData = async (studentId) => {
    try {
      const usersRef = collection(db, 'users'); 
      const q = query(usersRef, where('studentId', '==', studentId)); // Search by studentId field
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0]; // Get the first document
        setUserDetails(studentDoc.data());
      } else {
        console.error('No such student found!');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(error.message);
    }
  };

  const fetchCompletedPomodoros = async (studentId) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('studentId', '==', studentId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0];
        setCompletedPomodoros(studentDoc.data().completedPomodoros || 0);
      } else {
        console.error('No such student found!');
      }
    } catch (error) {
      console.error('Error fetching pomodoro data:', error);
    }
  };

  const fetchPomodoroTime = async (studentId) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('studentId', '==', studentId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0];
        setInitialTime(studentDoc.data().initialTime || 0);
      } else {
        console.warn('Pomodoro document not found.');
      }
    } catch (error) {
      console.error('Error fetching initial time:', error);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600000);
    const m = Math.floor((seconds % 3600000) / 60000);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div style={{ position: 'fixed', left: -10, top: '240px' }}>
        <SidePanel />
      </div>
      <StDashHeader userDetails={userDetails} />
      <div className="p-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

          <DashboardCard title="Pomodoro Sessions">
            <div className="flex items-center gap-4">
              <Clock className="text-blue-600" size={24} />
              <p className="text-2xl font-bold text-black">
                {completedPomodoros !== null ? (
                  <CountUp start={0} end={completedPomodoros} duration={2} separator="," />
                ) : 'Loading...'}
              </p>
              <p className="text-black text-sm">Total Completed Pomodoros</p>
            </div>
          </DashboardCard>
        </div>

        <RewardComponent studentId={studentId} />
        <LastSessionSummary studentId={studentId} />
        <EngagementChart studentId={studentId} />
      </div>
    </div>
  );
};

export default StudentDashboardCard;
