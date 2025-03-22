import React, { useEffect, useState } from 'react';
import logo2 from '../assets/images/HomePageIcons/scrolledLogo.png'
import { Link } from 'react-router-dom';
import ReportIssue from '../components/ReportIssue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';


const FAQPage = () => {

  const [currentUser, setCurrentUser] = useState(null);
const [studentData, setStudentData] = useState(null);

useEffect(() => {
  // Firebase auth example
  onAuthStateChanged(auth, (user) => {
    if (user) setCurrentUser(user);
  });

  // Fetch student data from Firestore
  const fetchStudentData = async () => {
    const docRef = doc(db, "students", "some_student_id");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) setStudentData(docSnap.data());
  };

  fetchStudentData();
}, []);

  return (
    <div className=" bg-gray-100 bg-[url('./assets/images/HomePageIcons/loginbg.jpeg')] bg-cover bg-center" >
      <div  className="flex justify-center items-center flex-col"><img
         src={logo2}
         alt="Logo"
         className="w-[160px] h-auto mt-10 "
       /></div>
      
      <div className="text-[30px] font-bold text-center mt-2 text-headingColor"><h1>Frequently Asked Questions</h1></div>
     <div className="flex justify-center items-center flex-col">
    {/*  <button className=" mt-6 text-white py-2 px-4 font-[600] " style={{width: 253, height: 38, background: '#0E3167', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 100}}>
                    <Link to='/'>Facing any issues? Report it!</Link>
                  </button> */}
                  <ReportIssue userId={currentUser?.uid} />
     </div>
      

      <section className='ml-20 font-sans bg-white'>
        <div style={{ marginBottom: '22px' }}>
          <p className='text-[22px] text-blue-700 ' ><strong>1. What is this app, and how can it help me?</strong></p>
          <p>This app helps you manage your study sessions efficiently using features like Pomodoro timers, task management, progress tracking, and motivational quotes. It keeps you focused and organized throughout your study routine.</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <p className='text-[22px] text-blue-700 ' ><strong>2. How do I set a study timer?</strong></p>
          <p>Simply select the desired study session from the timer options, or customize your own timer settings, and click "Start" to begin. You can pause and reset the timer whenever needed.</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <p className='text-[22px] text-blue-700 ' ><strong>3. Can I track my study progress?</strong></p>
          <p>Yes, the app offers visual progress tracking, showing your study hours, tasks completed, and overall progress.</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <p className='text-[22px] text-blue-700 ' ><strong>4. Can I set reminders for my study tasks?</strong></p>
          <p>Yes, you can set reminders for each task to ensure you stay on track with your study goals.</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <p className='text-[22px] text-blue-700 ' ><strong>5. Is there a mobile version of the app?</strong></p>
          <p>Yes, the app is available for both web and mobile platforms, ensuring you can stay organized and focused wherever you are.</p>
        </div>
      </section>

      
    </div>
  );
};

export default FAQPage;
