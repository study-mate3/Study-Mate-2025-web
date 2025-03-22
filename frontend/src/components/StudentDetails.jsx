import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Adjust the path based on your project
import { useAuth } from '../contexts/AuthContext';
import emailjs from 'emailjs-com';
import Alert from './Alert';

const StudentDetailsPage = () => {
  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addedStudents, setAddedStudents] = useState([]);
  const { currentUser } = useAuth(); // Current user's ID from auth context
  const [absentTimes, setAbsentTimes] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [studentNames, setStudentNames] = useState({}); 

  
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600000);
    const m = Math.floor((seconds % 3600000) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }; 
  
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

            const userName = userData.name;
            console.log("Current User Name:", userName); // Log the user's name
            setAddedStudents(userData.addedStudents || []);
            setCurrentUserName(userName);
            

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
  
              // Fetch rewards and session summary
              const rewardsRef = doc(db, 'users', studentDoc.id, 'rewards', 'pomodoro');
              const rewardsSnap = await getDoc(rewardsRef);
  
              const sessionSummaryRef = doc(db, 'users', studentDoc.id, 'rewards', 'points');
              const sessionSummarySnap = await getDoc(sessionSummaryRef);
  
              const pointsRef = doc(db, 'users', studentDoc.id, 'rewards', 'points');
              const pointsSnap = await getDoc(pointsRef);

              const earlybirdRef = doc(db, 'users', studentDoc.id, 'rewards', 'earlybird');
              const earlybirdSnap = await getDoc(earlybirdRef);

              const nightowlRef = doc(db, 'users', studentDoc.id, 'rewards', 'nightowl');
              const nightowlSnap = await getDoc(nightowlRef);
            
              // Log sessionSummary to check if it's being fetched correctly
              console.log('Session Summary:', sessionSummarySnap.exists() ? sessionSummarySnap.data().sessionSummary : 'No session summary data');
  
              setStudentDetails({
                  name: studentData.name,
                  email: studentData.email,
                  completedPomodoros: studentData.completedPomodoros || 0,
                  absentTime: studentData.absentTime || [],
                  initialTime: formatTime(rewardsSnap.exists() ? Math.floor(rewardsSnap.data().initialTime / 1000) : 0),
                  sessionSummary: pointsSnap.exists() ? pointsSnap.data().sessionSummary : [], // Ensure you are passing the whole array
                  points: pointsSnap.exists() ? pointsSnap.data().points : 0,
                  earlybird: earlybirdSnap.exists() ? earlybirdSnap.data().count : 0,
                  nightowl: nightowlSnap.exists()? nightowlSnap.data().count : 0,
                 });
  
    
            // Save student ID to addedStudents
            await saveStudentToFirebase(studentId);

            setStudentNames((prevNames) => ({
              ...prevNames,
              [studentId]: studentData.name,
            }));

            const templateParams = {
              student_name: studentData.name,
              student_email: studentData.email,
              parent_name: currentUserName,
          
            };
      
            emailjs
              .send(
                'service_869z5ji', // Replace with your EmailJS service ID
                'template_gjiz4fq', // Replace with your EmailJS template ID
                templateParams,
                '9Ai-grfLxkPVUUyqz' // Replace with your EmailJS public key
              )
              .then(
                (response) => {
                  console.log('Email sent successfully!', response.status, response.text);
                  /* setAlertMessage("Student notified successfully via email about being added."); */
                  setShowAlert(false);
                },
                (error) => {
                  console.error("Student notified failed via email about being added.", error);
                }
              );


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
    
      const showStudentDetails = async (studentId) => {
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
    
                // Fetch rewards and session summary
                const rewardsRef = doc(db, 'users', studentDoc.id, 'rewards', 'pomodoro');
                const rewardsSnap = await getDoc(rewardsRef);
    
                const sessionSummaryRef = doc(db, 'users', studentDoc.id, 'rewards', 'points');
                const sessionSummarySnap = await getDoc(sessionSummaryRef);
    
                const pointsRef = doc(db, 'users', studentDoc.id, 'rewards', 'points');
                const pointsSnap = await getDoc(pointsRef);

                const earlybirdRef = doc(db, 'users', studentDoc.id, 'rewards', 'earlybird');
                const earlybirdSnap = await getDoc(earlybirdRef);

                const nightowlRef = doc(db, 'users', studentDoc.id, 'rewards', 'nightowl');
                const nightowlSnap = await getDoc(nightowlRef);
              
                // Log sessionSummary to check if it's being fetched correctly
                console.log('Session Summary:', sessionSummarySnap.exists() ? sessionSummarySnap.data().sessionSummary : 'No session summary data');
    
                setStudentDetails({
                    name: studentData.name,
                    email: studentData.email,
                    completedPomodoros: studentData.completedPomodoros || 0,
                    absentTime: studentData.absentTime || [],
                    initialTime: formatTime(rewardsSnap.exists() ? Math.floor(rewardsSnap.data().initialTime / 1000) : 0),
                    sessionSummary: pointsSnap.exists() ? pointsSnap.data().sessionSummary : [], // Ensure you are passing the whole array
                    points: pointsSnap.exists() ? pointsSnap.data().points : 0,
                    earlybird: earlybirdSnap.exists() ? earlybirdSnap.data().count : 0,
                    nightowl: nightowlSnap.exists()? nightowlSnap.data().count : 0,
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
      {showAlert && <Alert message={alertMessage} onClose={() => setShowAlert(false)} />}

  <h1 className="text-2xl font-bold mb-4">View Your Student's Details</h1>
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
      {loading ? 'Loading...' : 'ADD'}
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
            onClick={() => fetchStudentDetails(id)} // Fetch details on click
            className="bg-blue-500 text-white px-3 py-1 rounded"
            style={{
              width: 120,
              background: 'linear-gradient(180deg, #0570B2 0%, #176BE8 100%)',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: 100,
            }}
          >
            {studentNames[id] || id} {/* Show name if fetched, else show ID */}
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
        <p>{studentDetails.completedPomodoros ? studentDetails.completedPomodoros: 0}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-medium">Total Completed Pomodoro Time</h3>
      <p className='text-2xl font-medium'> {studentDetails.initialTime || "Not Available"}</p>
    </div>
      {/* <div>
        {studentDetails?.sessionSummary?.length > 0 ? (
            studentDetails.sessionSummary.map((session, index) => (
                <div key={index} className="mb-4">
                    <p className="font-medium">Focus: {session.focus || 'Not Available'}</p>
                    <p className="font-medium">Productivity: {session.productivity || 'Not Available'}</p>
                    <p className="font-medium">Session Activity: {session.sessionActivity || 'Not Available'}</p>
                    <p className="font-medium">Timestamp: {session.timestamp || 'Not Available'}</p>
                    <p className="font-medium">Total Pomodoros: {session.totalPomodoro || 'Not Available'}</p>
                </div>
            ))
        ) : (
            <p>No session summary data available.</p>
        )}
    </div> */}
         
           
               {/*  <div>
                   {/*  <p className="font-medium">Points: {studentDetails?.points || 'Not Available'}</p>  
                     <p className="font-medium">Total Completed Pomodoro Time: {initialTime|| 'Not Available'}</p>
                    {/*  <p className="font-medium">no: {studentDetails?.nightowl || 'Not Available'}</p>
                     <p className="font-medium">eb: {studentDetails?.earlybird || 'Not Available'}</p> 
                </div> */}
    </div>

    {/* Second Row: Absent Times */}
    <div className="achievements-container text-center">
  <h2 className="text-2xl font-semibold mb-4">Your Child's Achievements This Week</h2>
  {studentDetails?.earlybird > 5 || studentDetails?.nightowl > 5 || studentDetails?.points > 40 ? (
    <div className="achievements-row flex justify-center gap-10">
      {studentDetails?.earlybird > 5 && <img src="earlybird.png" width="160" alt="Early Bird" />}
      {studentDetails?.nightowl > 5 && <img src="nightowl.png" width="160" alt="Night Owl" />}
      {studentDetails?.points > 40 && <img src="focuspearl.png" width="160" alt="Points Achieved" />}
    </div>
  ) : (
    <p className="text-lg text-gray-600 font-semibold mt-4">No badges achieved 😕. Encourage your child to study more! </p>
  )}


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