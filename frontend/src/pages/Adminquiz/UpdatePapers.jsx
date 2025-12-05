import { useState, useEffect } from "react";
import {
  collectionGroup,  // 👈 add this
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const UpdatePapers = () => {
  const [papers, setPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState("");
  const [paperDetails, setPaperDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch ALL papers from ALL categories using collectionGroup
  useEffect(() => {
    const fetchAllPapers = async () => {
      try {
        const cg = collectionGroup(db, "papersList");
        const snapshot = await getDocs(cg);

        const allPapers = snapshot.docs.map((d) => {
          // parent path: papers/{categoryId}/papersList/{docId}
          const categoryId = d.ref.parent.parent.id;
          return {
            id: d.id,
            categoryId,
            ...d.data(),
          };
        });

        console.log("Fetched all papers:", allPapers);
        setPapers(allPapers);
      } catch (e) {
        console.error("Error fetching papers:", e);
      }
    };
    fetchAllPapers();
  }, []);

  const handleSelectPaper = async (value) => {
    if (!value) return;
    const [categoryId, paperId] = value.split("|");
    setSelectedPaperId(value);
    setLoading(true);
    try {
      const paperRef = doc(db, "papers", categoryId, "papersList", paperId);
      const snap = await getDoc(paperRef);
      if (snap.exists()) setPaperDetails({ id: paperId, categoryId, ...snap.data() });
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...paperDetails.questions];
    updated[index][field] = value;
    setPaperDetails({ ...paperDetails, questions: updated });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...paperDetails.questions];
    updated[qIndex].options[oIndex] = value;
    setPaperDetails({ ...paperDetails, questions: updated });
  };

  const toggleCorrectAnswer = (qIndex, oIndex) => {
    const updated = [...paperDetails.questions];
    const isCorrect = updated[qIndex].correctAnswers.includes(oIndex);
    updated[qIndex].correctAnswers = isCorrect
      ? updated[qIndex].correctAnswers.filter((i) => i !== oIndex)
      : [...updated[qIndex].correctAnswers, oIndex];
    setPaperDetails({ ...paperDetails, questions: updated });
  };

  const handleAddQuestion = () => {
    const newQ = { question: "", image: "", options: ["", "", "", ""], correctAnswers: [] };
    setPaperDetails({ ...paperDetails, questions: [...paperDetails.questions, newQ] });
  };

  const handleDeleteQuestion = (index) => {
    const updated = [...paperDetails.questions];
    updated.splice(index, 1);
    setPaperDetails({ ...paperDetails, questions: updated });
  };

  const handleSaveChanges = async () => {
    if (!paperDetails) return alert("No paper selected!");
    const paperRef = doc(db, "papers", paperDetails.categoryId, "papersList", paperDetails.id);
    await updateDoc(paperRef, { questions: paperDetails.questions });
    alert("Paper updated successfully!");
  };

  const handleQuizNavigate = () => {navigate("/adminQuiz"); };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">Update Existing Papers</h1>

       <button className="mt-6 mb-6 text-blue-800 py-2 px-4 font-[700] mr-2" style={{width: 240, height: 38, borderColor:'#293dbcff',borderWidth:'0.2px', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 100}}
    onClick={handleQuizNavigate} >
    Add New Papers
                  </button>

      <div className="mb-6">
        <label className="block font-medium mb-2 text-gray-700">Select a Paper</label>
        <select
          className="border p-2 rounded w-full"
          value={selectedPaperId}
          onChange={(e) => handleSelectPaper(e.target.value)}
        >
          <option value="">Choose Paper</option>
          {papers.map((p) => (
            <option key={`${p.categoryId}_${p.id}`} value={`${p.categoryId}|${p.id}`}>
              [{p.categoryId}] {p.year || "Year"} - {p.subject || "Subject"} ({p.medium || "N/A"})
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-600 text-center">Loading...</p>}

      {paperDetails && (
        <>
          <div className="mb-6 text-center text-gray-700">
            <h2 className="text-xl font-semibold mb-2">
              Editing: {paperDetails.year} {paperDetails.subject} ({paperDetails.medium})
            </h2>
            <p className="text-sm">
              Time Limit: {paperDetails.timeLimit} mins | Marks per Question: {paperDetails.marksPerQuestion}
            </p>
          </div>

          <div className="space-y-6">
            {paperDetails.questions?.map((q, qIndex) => (
              <div key={qIndex} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800">Question {qIndex + 1}</h3>
                  <button className="text-red-500 text-sm underline" onClick={() => handleDeleteQuestion(qIndex)}>
                    Delete
                  </button>
                </div>

                <textarea
                  className="w-full border p-2 rounded mb-3"
                  rows="2"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                  placeholder="Edit question text"
                />

                <input
                  type="text"
                  className="w-full border p-2 rounded mb-3"
                  value={q.image || ""}
                  onChange={(e) => handleQuestionChange(qIndex, "image", e.target.value)}
                  placeholder="Optional: Enter image URL"
                />


                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border p-2 rounded"
                      value={opt}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                    />
                    <button
                      className={`px-3 py-1 rounded text-white ${
                        q.correctAnswers.includes(oIndex) ? "bg-green-600" : "bg-gray-400"
                      }`}
                      onClick={() => toggleCorrectAnswer(qIndex, oIndex)}
                    >
                      ✓
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAddQuestion}>
              + Add New Question
            </button>
          </div>

          <div className="text-center mt-8">
            <button className="bg-green-600 text-white px-6 py-2 rounded shadow-md" onClick={handleSaveChanges}>
              Save All Changes
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UpdatePapers;
