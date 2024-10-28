import React from 'react';
import {
  UserIcon, HomeIcon, ClockIcon, PencilIcon, BellIcon, ArrowLeftOnRectangleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const SidePanel = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="w-[60px] ml-[20px] bg-blue-500 bg-opacity-240 flex flex-col justify-between 
    items-center py-4 rounded-full bg-opacity-80">
      {/* Top section icons */}
      <div className="space-y-6 mt-4">
        {/* Example for navigating onClick */}
        <button onClick={() => handleNavigate('/profile')}>
          <UserIcon className="h-8 w-8 text-white hover:text-blue-950 cursor-pointer" />
        </button>

        <button onClick={() => handleNavigate('/home')}>
          <HomeIcon className="h-8 w-8 mt-4 text-white hover:text-blue-950 cursor-pointer" />
        </button>

        <button onClick={() => handleNavigate('/schedule')}>
          <ClockIcon className="h-8 w-8 text-white hover:text-blue-950 cursor-pointer" />
        </button>

        <button onClick={() => handleNavigate('/to-do-before')}>
          <PencilIcon className="h-8 w-8 mt-4 text-white hover:text-blue-950 cursor-pointer" />
        </button>

        <button onClick={() => handleNavigate('/notifications')}>
          <BellIcon className="h-8 w-8 text-white hover:text-blue-950 cursor-pointer" />
        </button>

        <button onClick={() => handleNavigate('/logout')}>
          <ArrowLeftOnRectangleIcon className="h-8 w-8 text-white hover:text-blue-950 cursor-pointer" />
        </button>

        <button onClick={() => handleNavigate('/contact')}>
          <QuestionMarkCircleIcon className="h-8 w-8 mt-4 text-white hover:text-blue-950 cursor-pointer" />
        </button>
      </div>
    </div>
  );
};

export default SidePanel;
