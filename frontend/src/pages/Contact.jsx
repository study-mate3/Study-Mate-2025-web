import React, { useEffect, useState } from 'react';
import logo2 from '/whitelogo.png'
import { Link } from 'react-router-dom';
import ReportIssue from '../components/ReportIssue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import SidePanel from '../components/SidePanel';


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

 const sidePanelStyle = {
    position: 'fixed', // Fixes the panel position
    left: -10,
    top: '200px',
        }

  return (
    <div>
      <div style={sidePanelStyle}>
        <SidePanel/>
      </div>
   
    <div className=" bg-gray-100 bg-[url('./assets/images/HomePageIcons/loginbg.jpeg')] bg-cover bg-center" >
     
   <div className="fixed top-0 left-0 w-full bg-blue-500 p-3 z-40 shadow-md">
  {/* Logo (top-left) */}
  <div className="absolute top-3 left-4">
    <img
      src={logo2}
      alt="Logo"
      className="lg:w-[160px] w-[80px] md:w-[100px] h-auto"
    />
  </div>

  {/* Title + FAQ image (centered) */}
  <div className="flex items-center justify-center">
    <h2 className="mt-5 lg:text-[30px] text-[20px] font-bold text-white mr-2">
      Frequently Asked Questions
    </h2>
    <img src="/faq.png" alt="Faq" className="w-16 h-16" />
  </div>

  {/* Report Issue button (centered below title) */}
  <div className="flex justify-center items-center flex-col mt-[-20px] p-2">
    <ReportIssue userId={currentUser?.uid} />
  </div>
</div>

      

      <section className='ml-24 font-sans bg-white mt-40'>
        <div style={{ marginBottom: '22px' }}>
          <p className='lg:text-[22px] text-[18px] text-blue-700 ' ><strong>1. What is this app, and how can it help me?</strong></p>
          <p className='lg:text-[16px] text-[14px]'>This app helps you manage your study sessions efficiently using features like Pomodoro timers, task management, progress tracking, and motivational quotes. It keeps you focused and organized throughout your study routine.</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <p className='lg:text-[22px] text-[18px] text-blue-700 ' ><strong>2. How do I set a study timer?</strong></p>
          <p className='lg:text-[16px] text-[14px]'>Simply select the desired study session from the timer options, or customize your own timer settings, and click "Start" to begin. You can pause and reset the timer whenever needed.</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <p className='lg:text-[22px] text-[18px] text-blue-700 ' ><strong>3. Can I track my study progress?</strong></p>
          <p className='lg:text-[16px] text-[14px]'>Yes, the app offers visual progress tracking, showing your study hours, tasks completed, and overall progress.</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <p className='lg:text-[22px] text-[18px] text-blue-700 ' ><strong>4. Can I set reminders for my study tasks?</strong></p>
          <p className='lg:text-[16px] text-[14px]'>Yes, you can set reminders for each task to ensure you stay on track with your study goals.</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <p className='lg:text-[22px] text-[18px] text-blue-700 ' ><strong>5. Is there a mobile version of the app?</strong></p>
          <p className='lg:text-[16px] text-[14px]'>Yes, the app is available for both web and mobile platforms, ensuring you can stay organized and focused wherever you are.</p>
        </div>
      </section>

      
    </div>
     </div>
  );
};

export default FAQPage;
