import React from 'react';
import { Link } from 'react-router-dom';
import workingImg from '../assets/images/HomePageIcons/home_gif2.gif';

export default function Welcome() {
  return (
    <div className="m-0 min-h-screen">
      <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto px-6 py-20">
        
        {/* Text Section */}
        <div className="flex flex-col space-y-4 text-center md:text-left md:w-1/2 lg:mt-40">
          <h1 className="text-[#f6fafc] text-3xl sm:text-4xl md:text-5xl font-extrabold font-['Inter',sans-serif] leading-tight lg:-mt-10">
            Tick Tock, Study Rock
          </h1>

          <div className="text-sm text-white sm:text-base font-normal font-['Inter',sans-serif] leading-snug max-w-xl mx-auto md:mx-0 text-justify">
            <p className="text-2xl text-white font-bold text-center md:text-left">Welcome to StudyMate!</p>
            <p className="mt-2  font-bold lg:font-normal">
              Take control of your study time with our innovative app. Join us for a smarter, more engaging way to study and achieve your academic goals!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start pt-4">
            <Link to="/login">
              <button className="text-white font-bold py-2 px-6 shadow-md rounded-full "  style={{width: 153, height: 38, background: '#0E3167', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 100}}>
                Log In
              </button>
            </Link>
            <Link to="/role">
              <button className="text-[#0E3167] font-bold py-2 px-6"  style={{width: 212, height: 38, background: 'white', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 100, border: '1px #0E3167 solid'}}>
                Get Started Free
              </button>
            </Link>
          </div>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img src={workingImg} alt="StudyMate working" className="w-[250px] sm:w-[300px] md:w-[400px] lg:mt-12"/>
        </div>

      </section>
    </div>
  );
}
