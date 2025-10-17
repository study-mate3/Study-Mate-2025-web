// src/pages/RoleSelection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo2 from '../assets/images/HomePageIcons/scrolledLogo.png'
import studentIcon from '../assets/images/HomePageIcons/student.png';
import parentIcon from '../assets/images/HomePageIcons/parent.png';



const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    navigate(`/signup/${role}`);
  };

  return (
<div className="flex justify-center items-center min-h-screen bg-gray-100 bg-[url('./assets/images/HomePageIcons/loginbg.jpeg')] bg-cover bg-center">
<div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
  <div className="flex justify-center items-center w-[400px]">
        <img src={logo2} alt="Logo" className="w-[140px] h-auto pb-4" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Create your Account</h2>
        <h2 className="text-xl text-[#002761] font-semibold ">Which account fits you best?</h2>
        <h2 className="text-xl text-[#002761] font-bold mb-10">Choose your role.</h2>
        <div className="flex justify-center space-x-10">

        <div className="w-[400px] h-[172px] bg-[#bfd8fd] rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex flex-col items-center justify-between p-4"
        onClick={() => handleRoleSelection("student")}>
        <img
            src={studentIcon}
            alt="Student Icon"
            className="w-[100px] h-[100px] mb-2" 
          />
          <button
            
            className="w-full text-black font-semibold py-2 rounded hover:bg-blue-300"
          >
            Student
          </button>
        </div>

        <div className="w-[400px] h-[172px] bg-[#bfd8fd] rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex flex-col items-center justify-between p-4"
         onClick={() => handleRoleSelection("parent")}>
          <img
            src={parentIcon}
            alt="Parent Icon"
            className="w-[100px] h-[100px] mb-2" 
          />
          <button
           
            className="w-full text-black font-semibold py-2 rounded hover:bg-blue-300"
          >
            Parent
          </button>
        </div>
      </div>

      </div>
    </div>
  );
};

export default RoleSelection;
