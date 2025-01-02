import React from 'react';
import {Link} from 'react-router-dom';
import workingImg from '../assets/images/HomePageIcons/home_gif2.gif'



export default function Welcome() {
  return (
    <div className='m-0'> 
      <section className='flex'>
         {/*  <div className="container relative w-full bg-[url('./assets/images/HomePageIcons/bg_img_math.png')] 
          bg-right bg-center bg-no-repeat" */} 
          <div>
            <div className="absolute "></div> 
            <div className="relative z-10 flex items-center justify-between gap-20 max-w-7xl mx-auto px-6 pb-8">
              
              <div className="flex flex-col space-y-4 w-2/3 pb-0 pt-40">
              <div className='mt-[-15px]'>
              <h1 className="text-[#f6fafc] text-5xl font-extrabold font-['Roboto',sans-serif] leading-[65px] ">
                Tick Tock, Study Rock
                </h1>
              </div>
                
                <div className="w-[576px] text-justify"><span class="text-white text-3xl font-bold font-['Roboto',sans-serif] leading-[27px]">Welcome to StudyMate!<br/></span><span class="text-[#002761] text-[32px] font-normal font-['Roboto',sans-serif] leading-[27px]"><br/></span><span class="text-white text-base font-normal font-['Roboto',sans-serif] leading-snug">Take control of your study time with our innovative app. Join us for a smarter, more engaging way to study and achieve your academic goals!</span></div>
      
                <div className="flex space-x-4 pb-8 pt-4">
                  <button className=" text-white py-2 px-4 font-[700] " style={{width: 153, height: 38, background: '#0E3167', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 100}}>
                    <Link to='/login'>Log In</Link>
                  </button>
                  <button className=" text-[#0E3167] font-[700] py-2 px-4 "  style={{width: 212, height: 38, background: 'white', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 100, border: '1px #0E3167 solid'}}>
                    <Link to='/role'>Get Started Free</Link>
                  </button>
                </div>
              </div>
      
              <div className="w-1/3 flex justify-center items-center mt-20">
                <div className="w-[400px]"><img src={workingImg} alt="" /></div>
              </div>
              
            </div>
          </div>
          </section>
          
    </div>
  )
}
