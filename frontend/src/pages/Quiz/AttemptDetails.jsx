import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import logo2 from '/scrolledLogo.png'
import SidePanel from "../../components/SidePanel";


const AttemptDetails = () => {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [paperData, setPaperData] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

   const sidePanelStyle = {
    position: 'fixed',
    left: -10,
    top: '200px',
  };

 useEffect(() => {
  const fetchAttemptDetails = async () => {
    try {
      if (!user) return;

      // Fetch attempt data
      const attemptRef = doc(db, "users", user.uid, "paper_attempts", attemptId);
      const attemptSnap = await getDoc(attemptRef);

      if (attemptSnap.exists()) {
        const attemptData = attemptSnap.data();
        setAttempt(attemptData);

        // ✅ Use the category stored in the attempt (e.g., "ol" or "al")
        const category = attemptData.category || "ol"; // fallback to 'ol' if missing

        // Fetch the actual paper data
        const paperRef = doc(db, "papers", category, "papersList", attemptData.paperId);
        const paperSnap = await getDoc(paperRef);

        if (paperSnap.exists()) {
          setPaperData(paperSnap.data());
        } else {
          console.error(`Paper not found in ${category} papersList`);
        }
      } else {
        console.error("Attempt not found.");
      }
    } catch (error) {
      console.error("Error fetching attempt details:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchAttemptDetails();
}, [attemptId, user]);


  if (loading) return <p className="text-center mt-10">Loading attempt...</p>;
  if (!attempt || !paperData)
    return <p className="text-center mt-10 text-gray-600">Attempt not found.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
       {/* <div style={sidePanelStyle}>
               <SidePanel/>
              </div> */}
      <div className="absolute top-3 left-4">
                                        <img
                                          src={logo2}
                                          alt="Logo"
                                          className="lg:w-[160px] w-[80px] md:w-[100px] h-auto "
                                        />
                                      </div>
      <h1 className="text-2xl font-bold text-center text-blue-700 mb-2">
        {paperData.subject} ({paperData.year})
      </h1>
      <p className="text-center text-gray-600 mb-6">
        {paperData.medium} Medium | Score:{" "}
        <span className="font-semibold text-green-600">
          {attempt.score}/{attempt.totalQuestions}
        </span>{" "}
        ({attempt.percentage}%)
      </p>

      {/* Questions Review */}
      {paperData.questions.map((q, index) => {
  const selectedObj = attempt.selectedAnswers[index];
  const selected = selectedObj?.choice; // ✅ get the choice
  const tool = selectedObj?.tool; // optional, if you want to display tool type
  const correct = q.correctAnswers[0];

  const isCorrect = selected === correct;

  return (
    <div
      key={index}
      className={`mb-6 border rounded-lg p-4 ${
        isCorrect ? "bg-green-50" : "bg-red-50"
      } shadow-sm`}
    >
      <p className="font-semibold mb-2">
        {index + 1}. {q.question}
      </p>
      {q.options.map((opt, i) => (
        <div key={i} className="ml-4 mb-1">
          <label
            className={`flex items-center p-1 rounded ${
              i === correct
                ? "bg-green-200"
                : i === selected && i !== correct
                ? "bg-red-200"
                : ""
            }`}
          >
            <input type="radio" checked={i === selected} readOnly className="mr-2" />
            {opt}
          </label>
        </div>
      ))}

      <p className="text-sm text-gray-600 mt-2">
        ✅ Correct Answer: <span className="font-semibold">{q.options[correct]}</span>
      </p>
      {/* <p className="text-sm text-gray-600">
        🧠 Your Answer:{" "}
        <span className="font-semibold">
          {selected !== undefined ? q.options[selected] : "Not answered"}
        </span>
        {tool && (
          <span className="ml-2 text-xs text-gray-500">
            ({tool === "pen" ? "🖊️ Pen" : "✏️ Pencil"})
          </span>
        )}
      </p> */}
    </div>
  );
})}

    </div>
  );
};

export default AttemptDetails;
