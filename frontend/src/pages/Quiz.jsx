import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import logo2 from '../../src/assets/images/HomePageIcons/scrolledLogo.png';
import SidePanel from '../components/SidePanel';
import { useNavigate } from 'react-router-dom'; // for redirect

const Quiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizLink, setSelectedQuizLink] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [userPaid, setUserPaid] = useState(false);

  const navigate = useNavigate();

  const sidePanelStyle = {
    position: 'fixed',
    left: -10,
    top: '240px',
  };

  useEffect(() => {
    const checkPaymentStatus = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().paid === 'yes') {
              setUserPaid(true);
              fetchQuizzes();
            } else {
              navigate('/payment'); // redirect to payment page
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          } finally {
            setLoadingPage(false);
          }
        } else {
          alert('Please log in to access quizzes.');
          navigate('/login');
        }
      });
    };

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

    checkPaymentStatus();
  }, [navigate]);

  const handleShowResults = () => {
    setLoadingResult(true);
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(collection(db, 'quiz_results'), where('email', '==', user.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const results = querySnapshot.docs.map(doc => doc.data());
            setQuizResult(results);
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
        alert('You must be logged in to view quiz results.');
        setLoadingResult(false);
      }
    });
  };

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!userPaid) {
    return null; 
  }

  return (
    <div className="p-10">
      <div className="bg-gray-100 bg-[url('./src/assets/images/HomePageIcons/loginbg.jpeg')] bg-cover bg-center">
        <div style={sidePanelStyle}>
          <SidePanel />
        </div>
        <div className="flex justify-center items-center flex-col">
          <img
            src={logo2}
            alt="Logo"
            className="w-[160px] h-auto mt-2"
          />
        </div>
        {!selectedQuizLink && (
          <>
          
            <div className="flex items-center justify-center mt-2">
  <h2 className="text-[30px] font-extrabold text-headingColor mr-2">
    Welcome to the Quiz Zone!
  </h2>
  <img src="/quiz.png" alt="Quiz" className="w-24 h-24" />
</div>

            <div className="bg-white p-8">
              <p>
                Explore a growing collection of quizzes designed to test your knowledge and help you track your progress. 
                We're proud to collaborate with ClassMarker.com to deliver high-quality, interactive assessments.
              </p>
              <p className="mt-2 font-semibold">
                Please note: If a parent account is linked to yours, they will also be able to view your quiz results through their dashboard.
              </p>

              <p className="mt-4 font-bold text-lg">
                📝 How to Take Quizzes on StudyMate
              </p>

              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>👉 Start a Quiz:</strong> Click any quiz name to begin.</li>
                <li><strong>✅ View Your Results:</strong> See your score and correct answers after finishing.</li>
                <li><strong>🔗 Access Anytime:</strong> Use the result URL to revisit anytime.</li>
                <li>
                  <strong>💬 Request New Quizzes:</strong> 
                  {' '}
                  <a
                    href="http://localhost:5173/faq"
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Request here
                  </a>.
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
