import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/HomePageIcons/whitelogo.png';
import AlarmIcon from '../../assets/images/HomePageIcons/timer.gif';
import scrolledLogo from '../../assets/images/HomePageIcons/scrolledLogo.png';


const NavLinks = [
  { key: 'welcome', display: 'Home' },
  { key: 'downloads', display: 'Downloads' },
  { key: 'features', display: 'Features' },
];

const Header = ({ onScrollToSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();



  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const welcomeSection = document.querySelector('#welcome-section');
      const welcomeHeight = welcomeSection?.offsetHeight || 0;

      setIsScrolled(scrollY > welcomeHeight);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg text-black' : 'bg-transparent text-white'
      }`}
    >
      <div className="container flex items-center justify-between h-[100px]">
        {/* Logo */}
        <div className="w-[192px]">
          <img
          src={isScrolled ? scrolledLogo : logo} // Change logo based on scroll state
          alt="Logo"
          className="w-full h-full"
          />
        </div>

        {/* Center Button */}
        <div className="relative">
          <button
            style={{
              top: '35px',
              left: '233px',
              width: 262,
              height: 42,
              background: 'linear-gradient(180deg, #0419FB 0%, #0948A7 100%)',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: 100,
            }}
            onClick={() => navigate('/timer')}
            className="flex items-center justify-center gap-0 bg-gradient-to-b from-[#649EF3] to-[#0D63E3] shadow-md w-[316px] h-[48px] rounded-lg text-white radius-[15px]"
          >
            <img src={AlarmIcon} alt="" className="w-[20px]" />
            <span
              className="ml-4 font-extrabold leading-[29.05px]"
              style={{
                textAlign: 'right',
                color: 'white',
                fontSize: 18,
                fontFamily: '"Roboto", sans-serif',
                fontWeight: '600',
                wordWrap: 'break-word',
              }}
            >
              Set Your Study Plan
            </span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center">
          <ul className="flex items-center space-x-[88px] w-auto" style={{ fontFamily: '"Roboto", sans-serif' }}>
            {NavLinks.map((link) => (
              <li key={link.key}>
                <button
                  onClick={() => onScrollToSection(link.key)}
                  className={`${
                    isScrolled ? 'text-black' : 'text-white'
                  } text-[16px] leading-7 font-[500] hover:text-primaryColor`}
                >
                  {link.display}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
