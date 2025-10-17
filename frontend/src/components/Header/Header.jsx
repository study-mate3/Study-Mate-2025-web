import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // For menu icons
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
  const [menuOpen, setMenuOpen] = useState(false);
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
      <div className="container mx-auto flex items-center justify-between h-[100px] px-4">
        {/* Logo */}
        <div className="w-[160px]">
          <img
            src={isScrolled ? scrolledLogo : logo}
            alt="Logo"
            className="w-full h-full"
          />
        </div>

        {/* Timer Button - hidden in small screens */}
        <div >
        <button
            style={{
              top: '35px',
              left: '233px',              
              background: 'linear-gradient(180deg, #0419FB 0%, #0948A7 100%)',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: 100,
            }}
            onClick={() => navigate('/timer')}
            className="flex items-center justify-center gap-0 bg-gradient-to-b from-[#649EF3] to-[#0D63E3] shadow-md md:w-[316px] md:h-[48px] w-[200px] h-[40px] rounded-lg text-white radius-[15px]"
          >
            <img src={AlarmIcon} alt="" className="w-[20px] " />
            <span
              className="ml-4 font-extrabold leading-[29.05px] text-[14px] md:text-[18px]"
              style={{
                textAlign: 'right',
                color: 'white',    
                fontFamily: '"Inter", sans-serif',
                fontWeight: '600',
                wordWrap: 'break-word',
              }}
            >
              Set Your Study Plan
            </span>
          </button>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-[88px]">
          {NavLinks.map((link) => (
            <button
              key={link.key}
              onClick={() => onScrollToSection(link.key)}
              className={`text-[18px] font-normal hover:text-primaryColor ${
                isScrolled ? 'text-black' : 'text-white'
              }`}
            >
              {link.display}
            </button>
          ))}
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={`md:hidden bg-white text-black px-4 py-4`}>
          {NavLinks.map((link) => (
            <button
              key={link.key}
              onClick={() => {
                onScrollToSection(link.key);
                setMenuOpen(false);
              }}
              className="block w-full text-left py-2 font-medium text-[16px] border-b"
            >
              {link.display}
            </button>
          ))}
          <button
            onClick={() => {
              navigate('/timer');
              setMenuOpen(false);
            }}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            Set Your Study Plan
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
