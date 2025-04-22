import React from 'react';
import HomeImg2 from '../assets/images/HomePageIcons/home_img2.png';
import HomeImg3 from '../assets/images/HomePageIcons/home_img3.png';
import HomeImg4 from '../assets/images/HomePageIcons/home_img4.png'
import googlePlayIcon from '../assets/images/FooterIcons/googlePlayIcon.png'
import appleStoreIcon from '../assets/images/FooterIcons/appleStoreIcon.jpg'

const DownloadSection = () => {
  return (
    <div className="flex flex-col items-center bg-white py-5">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl px-4">
       

        
      </div>

      <div className="flex flex-col-reverse md:flex-row  items-center justify-between">
          <div >
            <img src={HomeImg2} alt="" className="w-[500px]" />
          </div>

          {/* <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-10 max-w-7xl w-full pb-16">
          <div className="md:w-1/2 w-full text-center md:text-left"> */}

          <div className='md:w-2/3 w-full text-center md:text-left' >
            <p className="text-[20px] sm:text-[40px] font-bold text-primaryColor mt-4 text-center md:text-left ">
            Your perfect study partner is
            </p>
            <p className="text-[30px] sm:text-[50px]  font-bold text-headingColor text-center md:text-left">
            Just a Tap Away!            </p>
          
            <p className="text-gray-600 mt-4 text-[16px] sm:text-[20px] text-center md:text-left">
            Take control of your study plans or keep track of your child's progress
            effortlessly with StudyMate. <br />
            <span className="font-bold">Best of all, it's free!</span> <br />
            Get started today by downloading from the Play Store or App Store.
          </p>
          <div className="flex space-x-4 mt-4">
          <img src={googlePlayIcon} alt="" className='h-11 rounded-xl h-10'/>
          <img src={appleStoreIcon} alt="" className='h-11 rounded-xl h-10'/>          </div>
          </div>
        </div>

      
      <div className="flex flex-col-reverse md:flex-row items-center justify-between">
      <div className='w-2/3'>
            <p className="text-[20px] sm:text-[40px] font-bold text-primaryColor mt-4 text-center md:text-left">
            Master Your Time with the 
            </p>
            <p className="text-[30px] sm:text-[50px] font-bold text-headingColor text-center md:text-left">
            Pomodoro Technique
            </p>
          
            <p className="text-[20px] text-gray-600 mt-4 text-center md:text-left">
            Our app uses the Pomodoro Technique to help you stay focused and productive. Alternate between
             work and short breaks with customizable timers, ensuring you make the most out of every study session.
            </p>
          </div>
          <div >
            <img src={HomeImg3} alt="" className="w-[500px]" />
          </div>
          
        </div>





      <div className="flex flex-col-reverse md:flex-row  items-center justify-between pt-20 gap-20">
          <div >
            <img src={HomeImg4} alt="" className="w-[400px]" />
          </div>
          <div className='w-2/3'>
            <p className="text-[20px] sm:text-[40px] font-bold text-primaryColor mt-4 text-center md:text-left">
              Parents, Stay involved in
            </p>
            <p className="text-[30px] sm:text-[50px] font-bold text-headingColor text-center md:text-left">
            Your Child's Progress 
            </p>
          
            <p className="text-[20px] text-gray-600 mt-4 text-center md:text-left">
            With StudyMate, parents can easily monitor their child's study habits and progress. 
            Receive detailed reports and stay informed about their academic journey.
            </p>
          </div>
        </div>



    </div>
  );
};

export default DownloadSection;