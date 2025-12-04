import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase/firebaseConfig";
import { FaPen, FaPencilAlt } from "react-icons/fa";

const QUESTIONS_PER_PAGE = 5;

const QuizAttempt = () => {
  const { category, paperId } = useParams();
  const [paperData, setPaperData] = useState(null);
  const [answers, setAnswers] = useState({});
// answers[qIndex] = { choice: idx, tool: "pen" | "pencil" }
  const [lockedAnswers, setLockedAnswers] = useState({}); // tracks pen-marked answers
  const [selectedTool, setSelectedTool] = useState(null); // "pen" or "pencil"
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(null);

  



  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchPaper = async () => {
      const paperRef = doc(db, "papers", category, "papersList", paperId);
      const paperSnap = await getDoc(paperRef);
      if (paperSnap.exists()) setPaperData(paperSnap.data());
      const data = paperSnap.data();
      setPaperData(data);
      setTimeLeft(data.timeLimit * 60); 
        };
    fetchPaper();
  }, [category, paperId]);

  useEffect(() => {
  if (!timeLeft || submitted) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        handleSubmit(); // ⏰ auto-submit when time runs out
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [timeLeft, submitted]);

const logDistraction = async () => {
  if (!user) return;

  await addDoc(collection(db, "users", user.uid, "distractions"), {
    category,
    paperId,
    time: new Date(),
    event: "TAB_SWITCH",
  });

  console.log("Distraction logged!");
};

// TAB SWITCH DETECTOR
useEffect(() => {
  const handleVisibility = () => {
    if (document.hidden) {
      logDistraction();
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, [user]);


const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};



  if (!paperData) return <p>Loading...</p>;

  const totalPages = Math.ceil(paperData.questions.length / QUESTIONS_PER_PAGE);

const handleSelect = (qIndex, idx) => {
  if (!selectedTool) {
    alert("Please select Pen or Pencil before marking an answer!");
    return;
  }

  const isLocked = lockedAnswers[qIndex];
  if (isLocked) return;

  setAnswers((prev) => ({
    ...prev,
    [qIndex]: { choice: idx, tool: selectedTool },
  }));

  // lock if pen
  if (selectedTool === "pen") {
    setLockedAnswers((prev) => ({ ...prev, [qIndex]: true }));
  }
};





const handleSubmit = async () => {
  let correct = 0;
  paperData.questions.forEach((q, i) => {
    if (answers[i]?.choice === q.correctAnswers?.[0]) {
      correct++;
    }
  });

  const percentage = ((correct / paperData.questions.length) * 100).toFixed(1);
  setScore({ correct, total: paperData.questions.length, percentage });
  setSubmitted(true);

  if (user) {
    const docRef = await addDoc(collection(db, "users", user.uid, "paper_attempts"), {
      category,
      paperId,
      subject: paperData.subject,
      year: paperData.year,
      selectedAnswers: answers,
      score: correct,
      totalQuestions: paperData.questions.length,
      percentage,
      createdAt: new Date(),
    });

    // ✅ store the new document ID
    setAttemptId(docRef.id);
  }
};


  // Pagination logic
  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const visibleQuestions = paperData.questions.slice(
    startIndex,
    startIndex + QUESTIONS_PER_PAGE
  );

  

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Left: Questions */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-4 text-blue-700 uppercase">
          {category} - {paperData.subject} ({paperData.year})
        </h2>

        


        {visibleQuestions.map((q, i) => {
          const questionIndex = startIndex + i;
          return (
            <div key={questionIndex} className="mb-5 border-b pb-3">
              <p className="font-semibold mb-2 text-gray-800">
                {questionIndex + 1}. {q.question}
              </p>
              {q.options.map((opt, idx) => (
                <p key={idx} className="text-gray-600">
                  {idx + 1}. {opt}
                </p>
              ))}
            </div>
          );
        })}

        {/* Navigation */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ← Previous
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Right: Answer Sheet */}
      <div className="md:w-1/3 w-full bg-white border rounded-lg p-4 shadow sticky top-6 h-fit">
        <h3 className="text-md font-semibold text-center mb-3 text-black">
          MCQ Answer Sheet
        </h3>
        {timeLeft !== null && !submitted && (
          <div className=" text-red-600 font-semibold mb-4">
            Time Left: {formatTime(timeLeft)}
          </div>
        )}

        {/* Tool selector */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <button
            className={`flex items-center gap-2 px-3 py-1 rounded border ${
              selectedTool === "pencil" ? "bg-yellow-200 border-yellow-400" : ""
            }`}
            onClick={() => setSelectedTool("pencil")}
          >
            <FaPencilAlt /> Pencil
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-1 rounded border ${
              selectedTool === "pen" ? "bg-blue-200 border-blue-400" : ""
            }`}
            onClick={() => setSelectedTool("pen")}
          >
            <FaPen /> Pen
          </button>
        </div>

        {/* Instruction */}
        <p className="text-sm text-gray-600 text-center mb-4">
          Use the <b>Pencil</b> to mark answers you can change later. <br/> Use the <b>Pen</b> for final answers once marked, they can’t be changed.
          <br/>ඔබට පසුව වෙනස් කිරීමට අවශ්‍ය පිළිතුරු සලකුණු කිරීමට <b>පැන්සල</b> භාවිතා කරන්න.<br/> අවසාන පිළිතුරු සඳහා <b>පෑන</b> භාවිතා කරන්න - වරක් සලකුණු කළ පසු ඒවා වෙනස් කළ නොහැක.
        </p>

        {/* Answer bubbles */}
        <div className="flex flex-col gap-2">
          {paperData.questions.map((_, qIndex) => (
            <div
              key={qIndex}
              className="flex items-center justify-start gap-3 border-b border-gray-200 pb-1"
            >
              <span className="w-6 text-right text-gray-600 font-semibold">
                {qIndex + 1}.
              </span>
              <div className="flex gap-2">
               {[1, 2, 3, 4, 5].map((num, idx) => {
                const isLocked = lockedAnswers[qIndex];
                const isSelected = answers[qIndex]?.choice === idx;
                const toolUsed = answers[qIndex]?.tool;


                // determine X mark style
                const xColor =
                    toolUsed === "pen"
                      ? "text-blue-900 font-bold"
                      : toolUsed === "pencil"
                      ? "text-gray-700 font-bold"
                      : "text-gray-500 font-bold";


                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(qIndex, idx)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-lg font-bold transition
                      ${
                        isSelected
                          ? "bg-transparent border-transparent"
                          : "border-gray-400 text-gray-500"
                      }
                      ${isLocked ? "cursor-not-allowed opacity-75" : ""}
                    `}
                   style={{
                    cursor: isLocked
                      ? "not-allowed"
                      : selectedTool === "pen"
                      ? "url('/pen-cursor.png') 4 4, auto"
                      : selectedTool === "pencil"
                      ? "url('/pencil-cursor.png') 4 4, auto"
                      : "pointer",
                  }}

                  >
                    {isSelected ? <span className={`${xColor}`}>X</span> : ""}
                  </div>
                );
              })}

              </div>
            </div>
          ))}
        </div>

        {!submitted ? (
          <button
            onClick={handleSubmit}
            className="mt-6 w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Submit Answers
          </button>
        ) : (
          <div className="mt-6 text-center text-green-600 font-bold">
              Marks: {score.correct}/{score.total} ({score.percentage}%)
              {attemptId && (
                <div className="mt-4">
                  <button
                    onClick={() => navigate(`/attempt/${attemptId}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Your Results
                  </button>
                </div>
              )}
            </div>

        )}
      </div>
    </div>
  );
};

export default QuizAttempt;
