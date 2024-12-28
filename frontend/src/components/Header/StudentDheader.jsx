import React from 'react';
import logo from './white_logo.png'; // Replace with your actual logo component or image
import './StudentDheader.css';

const StDashHeader = ({ userDetails }) => {
  return (
    <header className="headerbg fixed top-0 left-0 w-full text-white p-4 z-50">
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center text-white p-4">
        <h1 className="text-3xl font-bold" style={{ position: 'relative', top: '-20px' }}>
          {userDetails?.role === 'student'
            ? `Hello ${userDetails?.name}, Let's Check Out Your Progress!`
            : `Hello ${userDetails?.name}, view your student's progress here.`}
        </h1>
        <div className="absolute top-0 right-12" style={{ width: '160px', height: 'auto' }}>
          <img src={logo} alt="Logo" className="logo" />
        </div>
      </div>
    </header>
  );
};

export default StDashHeader;
