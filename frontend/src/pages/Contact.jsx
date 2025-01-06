import React from 'react';
import logo2 from '../assets/images/HomePageIcons/scrolledLogo.png'


const FAQPage = () => {
  return (
    <div >
      <div  className="flex justify-center items-center flex-col"><img
         src={logo2}
         alt="Logo"
         className="w-[160px] h-auto mt-10 "
       /></div>
      
      <div className="text-[30px] font-bold text-center mt-2 text-headingColor"><h1>Frequently Asked Questions</h1></div>
      

      <section className='ml-20 font-sans'>
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
