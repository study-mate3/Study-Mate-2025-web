import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import SidePanel from '../components/SidePanel';
import { useNavigate } from 'react-router-dom';
import PomodoroHeader from '../components/Header/PomodoroHeader';
import TimeManagementHeader from '../components/Header/TimeManagementHeader';



const ManageTime = () => {

  const sidePanelStyle = {
    position: 'fixed', // Fixes the panel position
    left: -10,
    top: '200px',
        }


  return (
    <div className="min-h-screen bg-white">
      <div style={sidePanelStyle}>
        <SidePanel/>
      </div>
      <TimeManagementHeader/>
      <div className="px-20 sm:px-6 lg:px-12 xl:px-24 pt-20 lg:pt-36">
      <div className="flex items-center mb-8">
       </div>
      </div>

    <div className=" max-w-6xl mx-auto px-16 ml-6 py-4 md:py-1 md:px-12 md:ml-12 bg-white" style={{fontFamily: "'Poppins', sans-serif"}}>
  {/* Heading */}
  <h1 className=" font-semibold text-blue-600 mb-4">
    Here are some tried-and-true habits to help you make the most of your study hours, especially when exams are near:
  </h1>

  {/* Subheading */}
 {/*  <p className="text-lg text-gray-700 text-center mb-10">
     🍅
  </p> */}

  {/* Two-column section */}
   

    {/* Right column - image */}
    <div className="flex justify-center ">
      <img
        src="/time-management.png" 
        alt="Pomodoro Timer"
        className="rounded-xl w-full max-w-5xl object-cover"
      />
  </div>
</div>

  <div className="mt-5 max-w-6xl mx-auto px-16 ml-6 py-4 md:py-1 md:px-12 md:ml-12 bg-white" style={{fontFamily: "'Poppins', sans-serif"}}>
  {/* Heading */}
 

  {/* Subheading */}
 {/*  <p className="text-lg text-gray-700 text-center mb-10">
     🍅
  </p> */}

 

  {/* Full-width section */}
  <div className="text-black text-md leading-relaxed">
    <p className="text-black text-lg font-semibold ">💬 Remember This</p>
    <br></br>
    <p>
     Studying smart isn’t about how long you sit — it’s about how well you focus.
 StudyMate’s timer, tasks, and tools are all designed to help you take control of your time, focus better, and achieve your goals confidently.
    </p>
    <p>“You don’t need more time. You just need to manage the time you have — wisely.” 🕒💙
</p>
  </div>
</div>

  
    </div>
  );
};

export default ManageTime;
