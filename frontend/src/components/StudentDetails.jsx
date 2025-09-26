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

                setStudentNames((prevNames) => ({
                  ...prevNames,
                  [studentId]: studentData.name,
                }));
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
  <div className="mx-auto max-w-7xl px-12 pt-20 sm:px-6 lg:px-8 lg:pt-36 ">
    {/* alert */}
    {showAlert && (
      <Alert message={alertMessage} onClose={() => setShowAlert(false)} />
    )}

    {/* Title + Add form */}
    <div className="mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl font-bold">
        View Your Student&apos;s Details
      </h1>
    </div>

    {/* Input + button — stack on mobile */}
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <p className="text-sm sm:text-base text-blue-700 font-semibold">
        You can add a student using the student ID shown in the student dashboard.
      </p>

      <div className="flex w-full sm:w-auto gap-2">
        <input
          type="text"
          value={studentIdInput}
          onChange={(e) => setStudentIdInput(e.target.value)}
          placeholder="Enter Student ID"
          className="w-full sm:w-56 rounded-xl border border-blue-600/70 px-3 py-2 text-sm sm:text-base shadow-sm outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={() => fetchStudentDetails(studentIdInput)}
          disabled={!studentIdInput || loading}
          className="
            w-full sm:w-[110px]
            rounded-full text-white text-sm sm:text-base font-semibold
            py-2 px-4 shadow
            disabled:opacity-60 disabled:cursor-not-allowed
            bg-gradient-to-b from-[#0570B2] to-[#176BE8]
          "
        >
          {loading ? 'Loading…' : 'ADD'}
        </button>
      </div>
    </div>

    {error && <p className="text-red-500 text-sm sm:text-base mb-4">{error}</p>}

    {/* Added students (chips) */}
    <div className="bg-gray-50 border border-gray-200 mt-4 rounded-xl p-4 sm:p-5 mb-6 ">
      <h2 className="font-bold text-lg sm:text-xl mb-3">Your Students</h2>

      {addedStudents.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {addedStudents.map((id) => (
            <button
              key={id}
              onClick={() => showStudentDetails(id)}
              className="
                rounded-full px-3 py-1 text-sm text-white shadow
                bg-gradient-to-b from-[#0570B2] to-[#176BE8]
                hover:brightness-110
              "
            >
              {studentNames[id] || id}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-sm sm:text-base">No students added yet.</p>
      )}
    </div>

    {/* Details */}
    {studentDetails && (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-2xl font-semibold mb-4">
          Progress Overview of {studentDetails?.name}
        </h2>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm sm:text-base font-medium text-gray-700">Name</h3>
            <p className="mt-1 text-base sm:text-lg font-semibold">{studentDetails.name}</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm sm:text-base font-medium text-gray-700">Email</h3>
            <p className="mt-1 text-base sm:text-lg font-semibold break-all">
              {studentDetails.email}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm sm:text-base font-medium text-gray-700">Completed Pomodoros</h3>
            <p className="mt-1 text-base sm:text-lg font-semibold">
              {studentDetails.completedPomodoros || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 md:col-span-2 lg:col-span-1">
            <h3 className="text-sm sm:text-base font-medium text-gray-700">
              Total Completed Pomodoro Time
            </h3>
            <p className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
              {studentDetails.initialTime || 'Not Available'}
            </p>
          </div>
        </div>

        {/* Achievements */}
        <div className="text-center">
          <h3 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-4">
            Your Child&apos;s Achievements This Week
          </h3>

          {studentDetails?.earlybird > 5 ||
          studentDetails?.nightowl > 5 ||
          studentDetails?.points > 40 ? (
            <div
              className="
                grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-center justify-items-center
              "
            >
              {studentDetails?.earlybird > 5 && (
                <div className="flex flex-col items-center">
                  <img src="earlybird.png" alt="Early Bird" className="w-28 sm:w-40 h-auto" />
                  <span className="mt-2 text-sm font-medium">Early Bird</span>
                </div>
              )}
              {studentDetails?.nightowl > 5 && (
                <div className="flex flex-col items-center">
                  <img src="nightowl.png" alt="Night Owl" className="w-28 sm:w-40 h-auto" />
                  <span className="mt-2 text-sm font-medium">Night Owl</span>
                </div>
              )}
              {studentDetails?.points > 40 && (
                <div className="flex flex-col items-center">
                  <img src="focuspearl.png" alt="Focus Pearl" className="w-28 sm:w-40 h-auto" />
                  <span className="mt-2 text-sm font-medium">Focus Pearl</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm sm:text-base text-gray-600 font-semibold mt-3">
              No badges achieved 😕. Encourage your child to study more!
            </p>
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