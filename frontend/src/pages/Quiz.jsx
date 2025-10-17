
import { useNavigate } from 'react-router-dom';
import SidePanel from '../components/SidePanel';
import logo2 from '/whitelogo.png'


const Quiz = () => {
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
        Practice Quizzes
        </h2>
        <img src="/quiz.png" alt="Quiz" className="w-20 h-20 lg:w-24 lg:h-24" /></div>
      </div>

     <div className="w-full flex flex-col gap-6 items-center justify-center mt-40">
      {/* Top Row */}
      <div className="flex flex-wrap gap-4 justify-center">
        {/* Completed Quizzes */}
        <div style={{background: '#EAF2FF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10}} className="flex items-center justify-between w-64 p-4 ">
          <div className="flex items-center gap-3">
            <img src="/completed.png" alt="Completed Quizzes" className="w-10 h-10" />
            <div>
              <h3 className='text-gray-800 font-inter font-semibold'>Completed Quizzes</h3>
               <p className="text-sm text-gray-600">View completed quizzes.</p>
            </div>
          </div>
          <span className="text-lg font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
            12
          </span>
        </div>

        {/* Previous Results */}
        <div style={{background: 'rgba(97.75, 160.65, 255, 0.34)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10}} className="flex items-center gap-3 w-64 p-4 transform transition duration-200 hover:-translate-y-1 hover:shadow-lg">
          <img src="/results.png" alt="Previous Results" className="w-10 h-10" />
          <div>
            <h3 className='text-gray-800 font-inter font-semibold '>Previous Results</h3>
            <p className="text-sm text-gray-600">Check how you scored last time</p>
          </div>
        </div>

        {/* Need Help */}
        <div style={{background: '#F5F5F5', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10}} className="flex items-center gap-3 w-64 p-4 transform transition duration-200 hover:-translate-y-1 hover:shadow-lg">
          <img src="/help.png" alt="Need Help" className="w-8 h-8" />
          <div>
            <h3 className='text-gray-800 font-inter font-semibold'>Need Help?</h3>
            <p className="text-sm text-gray-600">Quick Guide is here.</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-black mt-4">
        Pick Your Quiz Mode
      </h3>

      {/* Quiz Modes */}
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        <button style={{ background: 'rgba(108.38, 245.22, 255, 0.6)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10}} className="flex items-center gap-2 hover:bg-blue-100 px-5 py-3 transform transition duration-200 hover:-translate-y-1 hover:shadow-lg"  onClick={() => navigate('/olquiz')}>
          <img src="/ol.png" alt="O/L Past Papers" className="w-8 h-8" />
          <span className="font-medium text-gray-700">O/L Past Papers</span>
        </button>

        <button style={{ background: 'rgba(108.38, 245.22, 255, 0.6)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10}} className="flex items-center gap-2 hover:bg-blue-100 px-5 py-3 transform transition duration-200 hover:-translate-y-1 hover:shadow-lg">
          <img src="/al.png" alt="A/L Past Papers" className="w-8 h-8" />
          <span className="font-medium text-gray-700">A/L Past Papers</span>
        </button>

        <button style={{ background: 'rgba(108.38, 245.22, 255, 0.6)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10}} className="flex items-center gap-2 hover:bg-blue-100 px-5 py-3 transform transition duration-200 hover:-translate-y-1 hover:shadow-lg">
          <img src="/school.png" alt="School Model Papers" className="w-8 h-8" />
          <span className="font-medium text-gray-700">School Model Papers</span>
        </button>

        <button style={{background: 'linear-gradient(180deg, #0570B2 0%, #0745A3 100%)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10}} className="flex items-center gap-2 hover:bg-blue-700 text-white px-5 py-3 transform transition duration-200 hover:-translate-y-1 hover:shadow-lg"  onClick={() => navigate('/quizGenerator')}>
          <img src="/upload.png" alt="Upload Quiz" className="w-8 h-8" />
          <span className="font-medium">Upload & Generate Quiz</span>
        </button>
      </div>
    </div>
    </div>
  );
};

export default Quiz;