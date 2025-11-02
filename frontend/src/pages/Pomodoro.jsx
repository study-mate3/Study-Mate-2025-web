import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import SidePanel from '../components/SidePanel';
import { useNavigate } from 'react-router-dom';
import PomodoroHeader from '../components/Header/PomodoroHeader';



const Pomodoro = () => {

  const sidePanelStyle = {
    position: 'fixed', // Fixes the panel position
    left: -10,
    top: '200px',
        }
 const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div style={sidePanelStyle}>
        <SidePanel/>
      </div>
      <PomodoroHeader/>
      <div className="px-20 sm:px-6 lg:px-12 xl:px-24 pt-20 lg:pt-36">
      <div className="flex items-center mb-8">
       </div>
      </div>

    <div className=" max-w-6xl mx-auto px-16 ml-6 py-4 md:py-1 md:px-12 md:ml-12 bg-white" style={{fontFamily: "'Poppins', sans-serif"}}>
  {/* Heading */}
  <h1 className=" text-lg md:text-2xl font-semibold text-center text-blue-600 mb-4">
    Boost your focus, avoid burnout, and make every minute of study count.
  </h1>

  {/* Subheading */}
 {/*  <p className="text-lg text-gray-700 text-center mb-10">
     🍅
  </p> */}

  {/* Two-column section */}
  <div className="grid md:grid-cols-2 gap-8 items-center mb-10">
    {/* Left column - text */}
    <div className="space-y-4 text-gray-700 leading-relaxed">
      <h2 className="text-lg md:text-2xl font-semibold text-gray-900 md:mt-2">🍅 What Is the Pomodoro Timer?</h2>
      <p className='text-black text-md'>
        Have you ever started studying for “just 10 minutes”… and then somehow ended up scrolling
        through your phone an hour later? 😅 That’s where the Pomodoro Timer comes to your rescue.
      </p>
      <p className='text-black text-md'>
        The Pomodoro Technique was created by an Italian student named <b>Francesco Cirillo</b>, who
        used a tomato-shaped kitchen timer (called “Pomodoro” in Italian).
      </p>
      <p className='text-black text-md'>
        He discovered that breaking study time into small, focused intervals helped him stay
        motivated and avoid burnout.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 mt-6">Here’s how it works:</h3>
      <ul className="list-disc list-inside space-y-2 text-black text-md">
        <li>Study for a focused session — usually 25 minutes.</li>
        <li>Take a 5-minute break to refresh your mind.</li>
        <li>After 4 sessions, take a longer break (15–30 minutes).</li>
      </ul>
    </div>

    {/* Right column - image */}
    <div className="flex justify-center md:mt-[-60px]">
      <img
        src="/pomodoro1.png" 
        alt="Pomodoro Timer"
        className="rounded-xl shadow-lg w-full max-w-sm object-cover"
      />
    </div>
  </div>

  {/* Full-width section */}
  <div className="text-black text-md leading-relaxed">
    <p>
      It’s simple, but powerful. Why? Because it trains your brain to focus deeply for short bursts —
      just like a muscle getting stronger with each workout.
    </p>
  </div>
</div>

  <div className="mt-20 max-w-6xl mx-auto px-16 ml-6 py-4 md:py-1 md:px-12 md:ml-12 bg-white" style={{fontFamily: "'Poppins', sans-serif"}}>
  {/* Heading */}
 

  {/* Subheading */}
 {/*  <p className="text-lg text-gray-700 text-center mb-10">
     🍅
  </p> */}

  {/* Two-column section */}
  <div className="grid md:grid-cols-2 gap-8 items-center mb-10">
     <div className="flex justify-center md:mt-[-60px]">
      <img
        src="/pomodoro.png" 
        alt="Pomodoro Timer"
        className="rounded-xl shadow-lg w-full max-w-sm object-cover"
      />
    </div>
   
    <div className="space-y-4 text-gray-700 leading-relaxed">
      <h2 className="text-lg md:text-2xl font-semibold text-gray-900 md:mt-2">💡 Why Is It Important for Students?  </h2>
      <p className='text-black'>
        When exams get closer, it’s easy to feel overwhelmed by hundreds of pages, past papers, and revision plans.
 Many students try to study for hours nonstop, but here’s the truth — your brain doesn’t learn well that way.

      </p>
      <p className='text-black text-md'>
       The Pomodoro method helps you:
      </p>
      
      <ol className="list-decimal list-inside space-y-2 text-black text-md">
        <li><b>Avoid procrastination</b> – It’s easier to start when you only commit to 25 minutes.</li>
        <li><b>Improve focus</b> – You’re less likely to be distracted when you know a break is coming soon.</li>
        <li><b>Retain more</b> – Short breaks help your brain organize what you’ve just studied.</li>
        <li><b>Prevent burnout</b> – You stay consistent without exhausting yourself.</li>
      </ol>
    </div>

   
    
  </div>

  {/* Full-width section */}
  <div className="text-black text-md leading-relaxed">
    <p>
      With <b>StudyMate’s Smart Study Timer</b>, you don’t need to worry about counting time.
 You just set your study duration — and StudyMate handles the rest, tracking your focus through the camera and reminding you when it’s time to take a break.
    </p>
  </div>
</div>

    <div className=" max-w-6xl mx-auto px-16 ml-6 py-4 md:py-1 md:px-12 md:ml-12 bg-white md:mt-20" style={{fontFamily: "'Poppins', sans-serif"}}>

 <div className="grid md:grid-cols-2 gap-8 items-center mb-10">
    {/* Left column - text */}
    <div className="space-y-4 text-gray-700 leading-relaxed">
      <h2 className=" font-semibold text-gray-900 md:mt-2">🎯 A Little Story to Remember</h2>
      <p className='text-black'>
        Think of your brain like a phone battery. 🔋
 If you use it continuously without breaks, it overheats and drains faster.
 But if you charge it at the right times — it performs at its best all day.

      </p>
      <p className='text-black'>
       That’s what the Pomodoro Timer does for your mind.
 It charges your focus in cycles, helping you study efficiently without feeling tired.
      </p>

    </div>

    {/* Right column - image */}
    <div className="flex justify-center md:mt-[-60px]">
      <img
        src="/brain.png" 
        alt="Pomodoro Timer"
        className="rounded-xl w-full max-w-sm object-cover"
      />
      
    </div>

      <button
    
    className="w-full  text-white font-semibold text-[16px] h-[34px] bg-gradient-to-b from-[#0570b2] to-[#0745a2] rounded-[100px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] mt-2"
    onClick={() => navigate(`/time-management`)} 
    >
    Want to know how to manage your study time better?  
  </button>
  
  </div>
  </div>

    </div>
  );
};

export default Pomodoro;
