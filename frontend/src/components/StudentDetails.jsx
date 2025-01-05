import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Adjust the path based on your project
import { useAuth } from '../contexts/AuthContext';

const StudentDetailsPage = () => {
  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addedStudents, setAddedStudents] = useState([]);
  const { currentUser } = useAuth(); // Current user's ID from auth context
  const [absentTimes, setAbsentTimes] = useState([]);


  
    // Fetch added students on component mount
    const fetchAddedStudents = async () => {
        if (!currentUser || !currentUser.uid) {
          console.error('User not authenticated');
          return;
        }
    
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
    
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setAddedStudents(userData.addedStudents || []);
          } else {
            console.error('No user document found!');
          }
        } catch (error) {
          console.error('Error fetching added students:', error);
        }
      };
      // Save a student ID to the database
      const saveStudentToFirebase = async (studentId) => {
        if (!currentUser || !currentUser.uid) {
          console.error('User not authenticated');
          return;
        }
    
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
    
          await updateDoc(userDocRef, {
            addedStudents: Array.from(new Set([...(addedStudents || []), studentId])), // Avoid duplicates
          });
    
          setAddedStudents((prev) => Array.from(new Set([...prev, studentId])));
        } catch (error) {
          console.error('Error saving student ID to Firebase:', error);
        }
      };
    
      // Fetch `addedStudents` on component mount or when `currentUser` changes
      useEffect(() => {
        if (currentUser) {
          fetchAddedStudents();
        }
      }, [currentUser]);
    

      

      const fetchStudentDetails = async (studentId) => {
        setLoading(true);
        setError('');
        setStudentDetails(null);
    
        try {
          const studentQuery = query(
            collection(db, 'users'),
            where('studentId', '==', studentId),
            where('role', '==', 'student') // Ensure only students are fetched
          );
    
          const querySnapshot = await getDocs(studentQuery);
    
          if (!querySnapshot.empty) {
            const studentDoc = querySnapshot.docs[0];
            const studentData = studentDoc.data();
    
            setStudentDetails({
              name: studentData.name,
              email: studentData.email,
              completedPomodoros: studentData.completedPomodoros || 0,
              absentTime: studentData.absentTime || [],
            });
    
            // Save student ID to addedStudents
            await saveStudentToFirebase(studentId);
          } else {
            setError('No student found with the provided ID.');
          }
        } catch (err) {
          console.error('Error fetching student details:', err);
          setError('Failed to fetch student details. Please try again.');
        } finally {
          setLoading(false);
        }
      };
    
  

  return (
    <div className="container mx-auto pt-40">
      <div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold mb-4">View Your Student Details</h1>
  <div className="flex items-center">
    <input
      type="text"
      value={studentIdInput}
      onChange={(e) => setStudentIdInput(e.target.value)}
      placeholder="Enter Student ID"
      className=" rounded-xl shadow-sm border border-blue-600 p-2  mr-2"
    />
    <button
      onClick={() => fetchStudentDetails(studentIdInput)}
      className="bg-blue-500 text-white p-2 rounded"
      disabled={!studentIdInput || loading}
      style={{ width:100, background: 'linear-gradient(180deg, #0570B2 0%, #176BE8 100%)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 100}}

    >
      {loading ? 'Loading...' : 'Search'}
    </button>
    
  </div>
  
</div>
<p className='text-md text-blue-700 mb-10 font-semibold' >You can add a student using the student ID, which will be displayed in the student dashboard.</p>

{error && <p className="text-red-500">{error}</p>}




      {/* Top bar showing added student IDs */}
      <div className="bg-gray-100 p-2 rounded shadow mb-6">
        <h2 className="font-bold mb-4 text-xl">Your Students</h2>
        {addedStudents.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {addedStudents.map((id) => (
              <button
                key={id}
                onClick={() => fetchStudentDetails(id)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
                style={{ width:120,background: 'linear-gradient(180deg, #0570B2 0%, #176BE8 100%)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 100}}
              >
                {id}
              </button>
            ))}
          </div>
        ) : (
          <p>No students added yet.</p>
        )}
      </div>

      
      {studentDetails && (
  <div className="bg-gray-100 p-6 rounded shadow-md">
    <h2 className="text-2xl font-semibold mb-4">
    Progress Overview of {studentDetails?.name}
  </h2>
    {/* First Row: Name, Email, and Completed Pomodoros */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-medium">Name</h3>
        <p>{studentDetails.name}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-medium">Email</h3>
        <p>{studentDetails.email}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-medium">Completed Pomodoros</h3>
        <p>{studentDetails.completedPomodoros ? studentDetails.completedPomodoros / 2 : 0}</p>
      </div>
    </div>

    {/* Second Row: Absent Times */}
    <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-10">We noticed that your child was not focused on studying during these times... 🙁</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {studentDetails.absentTime && studentDetails.absentTime.slice(0, 3).map((time, index) => (
        <div key={index} className="p-4  rounded-2xl shadow-sm border border-red-600">
          <p><strong>Date:</strong> {new Date(time).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {new Date(time).toLocaleTimeString()}</p>
        </div>
      ))}
    
    </div>
  </div>
)}

    </div>
  );
};


export default StudentDetailsPage;


/* Firebase Rule:


rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
			allow read: if resource.data.role == 'student';
      match /tasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
} */
