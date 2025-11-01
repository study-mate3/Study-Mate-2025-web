import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const QuizInstructions = () => {
  const { category, paperId } = useParams();
  const navigate = useNavigate();
  const [paperData, setPaperData] = useState(null);

  useEffect(() => {
    const fetchPaper = async () => {
      const docRef = doc(db, "papers", category, "papersList", paperId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPaperData(docSnap.data());
      }
    };
    fetchPaper();
  }, [category, paperId]);

  if (!paperData) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 border rounded-xl shadow-md bg-white">
    <img src="/banner.png" alt="Quiz Banner" className="w-full h-30 object-cover rounded-t-xl mb-4" />
    <h2 className="text-2xl font-bold text-center mb-4">
        {paperData.subject} - {paperData.year}
      </h2>

     <div className="text-gray-700 mb-6 px-10">
        <p>
            <li>Answer all the questions. This paper contains <strong>{paperData.questions.length}</strong> questions, and you have <strong>{paperData.timeLimit} minutes</strong> to complete them. </li>
        </p>
        <p>
           <li> Mark your answers in the provided bubble sheet. Each page displays 10 questions. </li></p> <p><li>Use the <strong>Next</strong> button to move forward and the <strong>Previous</strong> button to go back.</li>
        </p>
         <li>Once you finish marking your answers, you can proceed to check them manually, or the quiz will automatically submit for checking when the time is up.</li>
        </div>

    <div className="text-black mb-6 px-10">
        <p>
            <li>සියලුම ප්‍රශ්න වලට පිළිතුරු සපයන්න. මෙම පත්‍රිකාවේ ප්‍රශ්න <strong>{paperData.questions.length}</strong> ක් අඩංගු වන අතර, ඒවා සම්පූර්ණ කිරීමට ඔබට විනාඩි <strong>{paperData.timeLimit}</strong> ක කාලයක් ඇත.</li>
        </p>
        <p>
           <li>සපයා ඇති පිළිතුරු පත්‍රයේ දී ඇති උපදෙස් අනුව ඔබේ පිළිතුරු සලකුණු කරන්න. සෑම පිටුවකම ප්‍රශ්න 10ක් පෙන්වයි.</li>
        </p>
        <p>
            <li>ඉදිරියට යාමට<strong> ඊළඟ</strong> බොත්තම සහ ආපසු යාමට <strong>පෙර</strong> බොත්තම භාවිතා කරන්න.</li>
        </p>
         <li>ඔබට පිළිතුරු ලකුණු කල පසු පරීක්ෂාවට යොමු කල හකි අතර කාලය අවසන් වූ විට ප්‍රශ්නාවලිය ස්වයංක්‍රීයව පරීක්ෂාවට යොමු වනු ඇත.</li>
        </div>

     {/*  <div className="bg-yellow-50 p-3 rounded-md text-gray-700 text-sm mb-6">
        <p>📋 <strong>Instructions:</strong></p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Select <b>Pencil</b> to mark answers that can be changed later.</li>
          <li>Select <b>Pen</b> to finalize answers (cannot be changed).</li>
          <li>The quiz will auto-submit when time runs out.</li>
        </ul>
      </div> */}

      <div className="text-center">
        <button
          onClick={() => navigate(`/quiz/${category}/${paperId}`)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizInstructions;
