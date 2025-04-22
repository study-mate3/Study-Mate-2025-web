import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import logo2 from '../../src/assets/images/HomePageIcons/scrolledLogo.png'
import SidePanel from '../components/SidePanel';


const Quiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizLink, setSelectedQuizLink] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);

  const sidePanelStyle = {
    position: 'fixed', // Fixes the panel position
    left: -10,
    top: '240px',
        }

  // Fetch quiz list
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'quizes'));
        const quizData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          link: doc.data().link,
        }));
        setQuizzes(quizData);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchQuizzes();
  }, []);

  // Fetch logged-in user's quiz result
  const handleShowResults = () => {
    setLoadingResult(true);
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(collection(db, 'quiz_results'), where('email', '==', user.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            // Assuming multiple results possible, map them
            const results = querySnapshot.docs.map(doc => doc.data());
            setQuizResult(results); // now an array
          } else {
            setQuizResult([]);
          }
          setShowResults(true);
        } catch (error) {
          console.error('Error fetching quiz results:', error);
        } finally {
          setLoadingResult(false);
        }
      } else {
        alert("You must be logged in to view quiz results.");
        setLoadingResult(false);
      }
    });
  };

  return (
    <div className='p-10'>
    <div className=" bg-gray-100 bg-[url('./src/assets/images/HomePageIcons/loginbg.jpeg')] bg-cover bg-center" >
    <div style={sidePanelStyle}>
          <SidePanel/>
          </div>
       <div  className="flex justify-center items-center flex-col"><img
               src={logo2}
               alt="Logo"
               className="w-[160px] h-auto mt-2 "
             /></div>
      {!selectedQuizLink && (
        <>
          <h2 className="text-[30px] mt-2 font-extra-bold text-center text-headingColor">
            Welcome to the Quiz Zone!
          </h2>
          <div className='bg-white p-8'>
          <p>
            Explore a growing collection of quizzes designed to test your knowledge and help you track your progress. 
            We're proud to collaborate with ClassMarker.com to deliver high-quality, interactive assessments. After 
            completing each quiz, you’ll be able to view your results, check the correct answers, and revisit your 
            scores anytime.
          </p>
          <p className='mt-2 font-semibold'>
            Please note: If a parent account is linked to yours, they will also be able to view your quiz results through their dashboard.
          </p>

          <p className='mt-4 font-bold text-lg'>
          📝 How to Take Quizzes on StudyMate </p>

          <p className='mt-2'></p>
         
          <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>👉 Start a Quiz:</strong> Simply click on any quiz name to begin. The quiz will open right on this page.
        </li>
        <li>
          <strong>✅ View Your Results:</strong> Once you complete a quiz, you'll be able to see your score and the correct answers immediately.
        </li>
        <li>
          <strong>🔗 Access Anytime:</strong> Don’t worry if you close the tab—you’ll get a result URL that lets you revisit your answers and results anytime you want.
        </li>
        <li>
          <strong>💬 Request New Quizzes:</strong> Want more quizzes on specific topics? Go to{' '}
          <a
            href="http://localhost:5173/faq"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            http://localhost:5173/faq
          </a>, click “Facing any issues? Report it”, then select “Request Quiz” and tell us your preferences.
        </li>
      </ul>
          <div className="flex flex-wrap justify-center gap-4 mt-6 mb-8">
            {quizzes.map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => setSelectedQuizLink(quiz.link)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-400 transition"
              >
                {quiz.id}
              </button>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <button
              onClick={handleShowResults}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-500 transition"
            >
              View Previous Quiz Results
            </button>
          </div>

          {/* Results display */}
          {showResults && (
            <div className="mt-6 max-w-xl mx-auto bg-gray-100 p-6 rounded shadow">
          {loadingResult ? (
  <p>Loading your results...</p>
) : quizResult && quizResult.length > 0 ? (
  quizResult.map((result, index) => (
    <div key={index} className="mb-4 p-4 bg-white rounded shadow">
      <p><strong>Quiz:</strong> {result.test}</p>
      <p><strong>Score:</strong> {result.score}</p>
      <p>
        <strong>View Result:</strong>{' '}
        <a
          href={result.result_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Click here
        </a>
      </p>

    </div>
  ))
) : (
  <p className="text-red-500">No quiz results found for your account yet.</p>
)}

            </div>
          )}
          </div>
        </>
      )}

      {selectedQuizLink && (
        <div className="flex justify-center">
          <iframe
            src={selectedQuizLink}
            width="700"
            height="800"
            frameBorder="0"
            allowFullScreen
            title="ClassMarker Quiz"
          ></iframe>
        </div>
      )}
    </div>
    </div>
  );
};

export default Quiz;
