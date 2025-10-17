import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const UpdatePapers = () => {
  const [papers, setPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState("");
  const [paperDetails, setPaperDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const categoryDoc = doc(db, "papers", "ol"); // “ol” document inside “papers”
  const papersCol = collection(doc(db, "papers", "ol"), "papersList");


  // Fetch available papers
  useEffect(() => {
  const fetchPapers = async () => {
    const papersCol = collection(doc(db, "papers", "ol"), "papersList");
    const snapshot = await getDocs(papersCol);
    const paperList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPapers(paperList);
  };
  fetchPapers();
}, []);

  // Load selected paper
  const handleSelectPaper = async (id) => {
  setLoading(true);
  const paperRef = doc(db, "papers", "ol", "papersList", id);
  const snap = await getDoc(paperRef);
  if (snap.exists()) setPaperDetails({ id: snap.id, ...snap.data() });
  setLoading(false);
};

  // Handle updates
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...paperDetails.questions];
    updatedQuestions[index][field] = value;
    setPaperDetails({ ...paperDetails, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...paperDetails.questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setPaperDetails({ ...paperDetails, questions: updatedQuestions });
  };

  const toggleCorrectAnswer = (qIndex, oIndex) => {
    const updatedQuestions = [...paperDetails.questions];
    const isCorrect = updatedQuestions[qIndex].correctAnswers.includes(oIndex);
    updatedQuestions[qIndex].correctAnswers = isCorrect
      ? updatedQuestions[qIndex].correctAnswers.filter((i) => i !== oIndex)
      : [...updatedQuestions[qIndex].correctAnswers, oIndex];
    setPaperDetails({ ...paperDetails, questions: updatedQuestions });
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      question: "",
      options: ["", "", "", ""],
      correctAnswers: [],
    };
    setPaperDetails({
      ...paperDetails,
      questions: [...paperDetails.questions, newQuestion],
    });
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = [...paperDetails.questions];
    updatedQuestions.splice(index, 1);
    setPaperDetails({ ...paperDetails, questions: updatedQuestions });
  };

  const handleSaveChanges = async () => {
    const paperRef = doc(db, "papers", "ol", selectedPaperId);
    await updateDoc(paperRef, { questions: paperDetails.questions });
    alert("Paper updated successfully!");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">
        Update Existing Papers
      </h1>

      {/* Select Paper */}
      <div className="mb-6">
        <label className="block font-medium mb-2 text-gray-700">
          Select a Paper
        </label>
        <select
          className="border p-2 rounded w-full"
          value={selectedPaperId}
          onChange={(e) => handleSelectPaper(e.target.value)}
        >
          <option value="">Choose Paper</option>
          {papers.map((paper) => (
            <option key={paper.id} value={paper.id}>
              {paper.year} - {paper.subject} ({paper.medium})
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-600 text-center">Loading...</p>}

      {/* Paper Editor */}
      {paperDetails && (
        <>
          <div className="mb-6 text-center text-gray-700">
            <h2 className="text-xl font-semibold mb-2">
              Editing: {paperDetails.year} {paperDetails.subject} (
              {paperDetails.medium})
            </h2>
            <p className="text-sm">
              Time Limit: {paperDetails.timeLimit} mins | Marks per Question:{" "}
              {paperDetails.marksPerQuestion}
            </p>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {paperDetails.questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="border p-4 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800">
                    Question {qIndex + 1}
                  </h3>
                  <button
                    className="text-red-500 text-sm underline"
                    onClick={() => handleDeleteQuestion(qIndex)}
                  >
                    Delete
                  </button>
                </div>

                <textarea
                  className="w-full border p-2 rounded mb-3"
                  rows="2"
                  value={q.question}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "question", e.target.value)
                  }
                  placeholder="Edit question text"
                />

                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border p-2 rounded"
                      value={opt}
                      onChange={(e) =>
                        handleOptionChange(qIndex, oIndex, e.target.value)
                      }
                      placeholder={`Option ${oIndex + 1}`}
                    />
                    <button
                      className={`px-3 py-1 rounded text-white ${
                        q.correctAnswers.includes(oIndex)
                          ? "bg-green-600"
                          : "bg-gray-400"
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

          {/* Add Question Button */}
          <div className="text-center mt-6">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handleAddQuestion}
            >
              + Add New Question
            </button>
          </div>

          {/* Save Changes */}
          <div className="text-center mt-8">
            <button
              className="bg-green-600 text-white px-6 py-2 rounded shadow-md"
              onClick={handleSaveChanges}
            >
              Save All Changes
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UpdatePapers;
