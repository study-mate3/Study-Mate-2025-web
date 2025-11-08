import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import SidePanel from "../../components/SidePanel";
import logo2 from '/whitelogo.png'


const CompletedQuizzes = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

   const sidePanelStyle = {
    position: 'fixed',
    left: -10,
    top: '200px',
  };

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!user) return;
      try {
        const attemptsRef = collection(db, "users", user.uid, "paper_attempts");
        const snapshot = await getDocs(attemptsRef);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by most recent
        data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

        setAttempts(data);
      } catch (error) {
        console.error("Error fetching attempts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [user]);

  if (loading) return <p className="text-center mt-10">Loading your attempts...</p>;
  if (!attempts.length)
    return <p className="text-center mt-10 text-gray-600">No previous attempts found.</p>;

  return (
        <div className="min-h-screen">
          <div style={sidePanelStyle}>
         <SidePanel/>
        </div>

         <div className="fixed top-0 left-0 w-full bg-blue-500 p-6 z-40 shadow-md">
                          <div className="absolute top-3 left-4">
                                  <img
                                    src={logo2}
                                    alt="Logo"
                                    className="lg:w-[160px] w-[80px] md:w-[100px] h-auto "
                                  />
                                </div>
                                 <div className="flex items-center justify-center">
                         <h2 className="lg:text-[30px] text-[20px] font-bold text-white mr-2">
                        📚 Completed Quizzes
                        </h2>
                        
                      </div>
                      </div>

    <div className="lg:p-6 p-16 max-w-3xl mx-auto lg:mt-[100px] mt-[20px]">

      <div className="grid gap-4">
        {attempts.map((attempt) => (
          <div
            key={attempt.id}
            className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md "
          >
           <h2 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-sm uppercase tracking-wide">
                {attempt.category}
            </span>
            {attempt.subject} ({attempt.year})
            </h2>

            <p className="text-sm text-gray-600">{attempt.medium} Medium</p>
            <p className="mt-2">
              <span className="font-semibold text-green-600">{attempt.score}</span> /{" "}
              {attempt.totalQuestions} correct (
              <span className="font-semibold text-blue-600">{attempt.percentage}%</span>)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {attempt.createdAt
                ? new Date(attempt.createdAt.seconds * 1000).toLocaleString()
                : "Unknown date"}
            </p>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default CompletedQuizzes;
