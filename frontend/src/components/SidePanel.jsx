import React from 'react';
import { UserIcon, HomeIcon, ClockIcon, PencilIcon, BellIcon, ArrowLeftOnRectangleIcon, 
QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { NewspaperIcon } from 'lucide-react';

const SidePanel = ({setName}) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);  // Sign out the user from Firebase

      // Clear local session (localStorage or cookies)
      localStorage.removeItem('userToken');
      localStorage.removeItem('username');
      
      // Redirect to home page or login page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Handle error (optional, show an error message to the user)
    }
  };
  const handleClick = (studentId) => {
    navigate(`/student-dashboard/${studentId}`);
  };
  return (
    <div className="w-[45px] ml-[20px] bg-blue-500 bg-opacity-140 flex flex-col justify-between 
    items-center py-4 rounded-full bg-opacity-80">
      {/* Top section icons */}
      <div className="space-y-6 mt-4">
      
    <UserIcon id="user" className="h-5 w-5 text-white hover:text-blue-950 hover:font-extrabold cursor-pointer" title='user dashboard'
    onClick={handleClick} />
  
        {/* Wrap the HomeIcon with Link */}
        <Link to="/">
          <HomeIcon id="home" className="h-5 w-5 mt-4 text-white hover:text-blue-950 hover:font-extrabold cursor-pointer" title='home page'/>
        </Link>

        <Link to="/timer">
          <ClockIcon  id="timer" className="h-5 w-5 mt-4 text-white hover:text-blue-950 hover:font-extrabold cursor-pointer" title='timer'/>
        </Link>

        <Link to="/todo-after-login">
          <PencilIcon id="todo" className="h-5 w-5 mt-4 text-white hover:text-blue-950 hover:font-extrabold cursor-pointer" title='to do list'/>
        </Link>

        <Link to='/quiz' title='quiz'>
          <NewspaperIcon id="quiz" className="h-5 w-5 mt-4 text-white hover:text-blue-950 hover:font-extrabold cursor-pointer"/>
        </Link>

        <Link to="/notifications">
          <BellIcon id="notifications" className="h-5 w-5 mt-4 text-white hover:text-blue-950 hover:font-extrabold cursor-pointer" title='notifications'/>
        </Link>

      
        <ArrowLeftOnRectangleIcon id="logout"
      className="h-5 w-5 text-white hover:text-blue-950 hover:font-extrabold cursor-pointer" title='log out'
      onClick={handleLogout} // Add click handler
    />
        <Link to="/faq">
          <QuestionMarkCircleIcon id="faq" className="h-5 w-5 mt-4 text-white hover:text-blue-950 cursor-pointer" title='faq' />
        </Link>
      </div>
    </div>
  );
};

export default SidePanel;
