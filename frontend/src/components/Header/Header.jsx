import { NavLink, useNavigate } from 'react-router-dom';
import { BiTimer } from 'react-icons/bi';
import logo from '../../assets/images/HomePageIcons/logo.png';
import AlarmIcon from '../../assets/images/HomePageIcons/timer.gif';

const NavLinks = [
  {
    path: '/home',
    display: 'Home',
  },
  {
    path: '/downloads',
    display: 'Downloads',
  },
  {
    path: '/features',
    display: 'Features',
  },
];

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="header flex items-center">
      <div className="container h-[100px] flex items-center justify-between">
        {/* Logo */}
        <div className="w-[192px] mt-2 ">
          <img src={logo} alt="Logo" className="w-full h-full" />
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
          <ul className="flex items-center space-x-[88px] w-auto" style={{ fontFamily: '"Roboto", sans-serif', }}>
            {NavLinks.map((link, index) => (
              <li key={index}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    isActive
                      ? 'text-primaryColor text-[16px] leading-7 font-[600]'
                      : 'text-textColor text-[16px] leading-7 font-[500] hover:text-primaryColor'
                  }
                >
                  {link.display}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
