import React from 'react';
import logo from './white_logo.png'; // Replace with your actual logo component or image
import './StudentDheader.css';
import DownloadPDFButton from '../DownloadPDFButton';

const StDashHeader = ({ userDetails }) => {
  return (
    <header className="headerbg fixed top-0 left-0 w-full text-white p-4 z-50">
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center text-white p-4">
      <div className="absolute top-12 left-12">
      <DownloadPDFButton/>
        </div>
       
        <h1 className="text-lg font-bold lg:text-3xl" style={{ position: 'relative', top: '-23px' }}>
          {userDetails?.role === 'student'
            ? `Hello ${userDetails?.name}, Let's Check Out Your Progress!`
            : `Hello ${userDetails?.name}, view your student's progress here.`}
        </h1>
        <div className="absolute top-2 right-3 sm:top-2 sm:right-6 md:top-0 md:right-12">
  <img
    src={logo}
    alt="Logo"
    className="w-20 sm:w-28 md:w-40 h-auto"
  />
</div>

      </div>
    </header>
  );
};

export default StDashHeader;
