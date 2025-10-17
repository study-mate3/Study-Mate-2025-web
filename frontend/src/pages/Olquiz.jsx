
import { useNavigate } from 'react-router-dom';
import SidePanel from '../components/SidePanel';
import logo2 from '/whitelogo.png'
import PaperSelector from '../components/PaperSelector';


const OLQuiz = () => {
  // Sample notification data - replace with your actual data
  const sidePanelStyle = {
    position: 'fixed',
    left: -10,
    top: '200px',
  };
 
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
        <div style={sidePanelStyle}>
         <SidePanel/>
        </div>
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-blue-500 p-3 z-40 shadow-md">
          <div className="absolute top-3 left-4">
                  <img
                    src={logo2}
                    alt="Logo"
                    className="lg:w-[160px] w-[80px] md:w-[100px] h-auto "
                  />
                </div>
                 <div className="flex items-center justify-center">
         <h2 className="lg:text-[30px] text-[20px] font-bold text-white mr-2">
        O/L Past Papers
        </h2>
        <img src="/quiz.png" alt="Quiz" className="w-20 h-20 lg:w-24 lg:h-24" /></div>
      </div>
        <div className="lg:p-6 max-w-4xl lg:mt-20 mx-auto p-20" >

    <div><PaperSelector/></div></div>
    </div>
  );
};

export default OLQuiz;