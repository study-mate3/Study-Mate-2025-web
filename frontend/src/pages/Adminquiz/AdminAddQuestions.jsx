import { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const AdminAddQuestion = () => {
  const [paperDetails, setPaperDetails] = useState({
    year: "",
    subject: "",
    medium: "",
    category: "ol",
    timeLimit: "",
    marksPerQuestion: "",
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswers: [],
  });

  const [selectedPaperId, setSelectedPaperId] = useState("");
  const navigate = useNavigate();

  const handleAddOption = () => {
    if (currentQuestion.options.length < 5) {
      setCurrentQuestion({
        ...currentQuestion,
        options: [...currentQuestion.options, ""],
      });
    }
  };

  const handleAddQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every(opt => opt)) {
      setQuestions([...questions, currentQuestion]);
      setCurrentQuestion({
        question: "",
        options: ["", "", "", ""],
        correctAnswers: [],
      });
    }
  };

  const handleSavePaper = async () => {
    if (!paperDetails.subject || !paperDetails.year) {
      alert("Please fill paper details first!");
      return;
    }

    const paperId = `${paperDetails.year}_${paperDetails.subject}_${paperDetails.medium}`;
    setSelectedPaperId(paperId);

    const paperRef = doc(db, "papers", paperDetails.category, "papersList", paperId);

    const data = {
      ...paperDetails,
      questions,
      createdAt: serverTimestamp(),
    };

    await setDoc(paperRef, data);
    alert("Paper saved successfully!");
  };

  const handleEditPaper = async () => {
    if (!selectedPaperId) {
      alert("No paper selected to update!");
      return;
    }
    const paperRef = doc(db, "papers", paperDetails.category, "papersList", selectedPaperId);
    await updateDoc(paperRef, { questions });
    alert("Questions updated successfully!");
  };

  const toggleCorrectAnswer = (index) => {
    const isSelected = currentQuestion.correctAnswers.includes(index);
    setCurrentQuestion({
      ...currentQuestion,
      correctAnswers: isSelected
        ? currentQuestion.correctAnswers.filter(i => i !== index)
        : [...currentQuestion.correctAnswers, index],
    });
  };

const handleWordUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const { default: mammoth } = await import("mammoth");

  const reader = new FileReader();

  reader.onload = async (ev) => {
    const arrayBuffer = ev.target.result;

    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    parseWordQuestions(text);
  };

  reader.readAsArrayBuffer(file);
};


const parseWordQuestions = (text) => {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l);

  const parsedQuestions = [];
  let currentQ = null;

  lines.forEach((line) => {
    // Match question numbers e.g. "1.", "2."
    if (/^\d+\./.test(line)) {
      if (currentQ) parsedQuestions.push(currentQ);

      currentQ = {
        question: line.replace(/^\d+\.\s*/, ""),
        options: [],
        correctAnswers: []
      };
    }
    // Match options A) B) C) D)
    else if (/^[A-D]\)/.test(line)) {
      const optionText = line.replace(/^[A-D]\)\s*/, "");
      if (currentQ) currentQ.options.push(optionText);
    }
  });

  if (currentQ) parsedQuestions.push(currentQ);

  // Add to existing questions
  setQuestions(prev => [...prev, ...parsedQuestions]);

  alert(`${parsedQuestions.length} questions imported from Word!`);
};


    const handleQuizNavigate = () => {navigate("/updateQuiz"); };


  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">
        Paper Management Panel
      </h1>

       <button className="mt-6 mb-6 text-blue-800 py-2 px-4 font-[700] mr-2" style={{width: 240, height: 38, borderColor:'#293dbcff',borderWidth:'0.2px', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 100}}
    onClick={handleQuizNavigate} >
    Update Existing Papers
                  </button>

      {/* Paper Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input
          className="border p-2 rounded"
          placeholder="Year (e.g. 2017)"
          value={paperDetails.year}
          onChange={(e) =>
            setPaperDetails({ ...paperDetails, year: e.target.value })
          }
        />
        <input
          className="border p-2 rounded"
          placeholder="Subject"
          value={paperDetails.subject}
          onChange={(e) =>
            setPaperDetails({ ...paperDetails, subject: e.target.value })
          }
        />
        <select
          className="border p-2 rounded"
          value={paperDetails.medium}
          onChange={(e) =>
            setPaperDetails({ ...paperDetails, medium: e.target.value })
          }
        >
          <option value="">Select Medium</option>
          <option value="English">English</option>
          <option value="Sinhala">Sinhala</option>
          <option value="Tamil">Tamil</option>
        </select>
        <select
          className="border p-2 rounded"
          value={paperDetails.category}
          onChange={(e) =>
            setPaperDetails({ ...paperDetails, category: e.target.value })
          }
        >
          <option value="ol">O/L</option>
          <option value="al">A/L</option>
          <option value="school">School Model Paper</option>
        </select>
        <input
          className="border p-2 rounded"
          placeholder="Time Limit (mins)"
          value={paperDetails.timeLimit}
          onChange={(e) =>
            setPaperDetails({ ...paperDetails, timeLimit: e.target.value })
          }
        />
        <input
          className="border p-2 rounded"
          placeholder="Marks per Question"
          value={paperDetails.marksPerQuestion}
          onChange={(e) =>
            setPaperDetails({ ...paperDetails, marksPerQuestion: e.target.value })
          }
        />
      </div>
      <div className="mb-6">
  <h2 className="text-lg font-semibold mb-2 text-gray-700">
    Import Questions from Word (.docx)
  </h2>

  <input
    type="file"
    accept=".docx"
    onChange={handleWordUpload}
    className="border p-2 rounded w-full"
  />

  <p className="text-sm text-gray-600 mt-1">
    Make sure your Word file follows this format:<br />
    <b>1. Question text</b><br />
    A) Option 1<br />
    B) Option 2<br />
    C) Option 3<br />
    D) Option 4<br />
    *(Correct answers must be selected manually after import.)*
  </p>
</div>

      {/* Question Input */}
      <div className="p-4 border rounded mb-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">
          Add Question
        </h2>
        <textarea
          className="w-full border p-2 rounded mb-3"
          rows="3"
          placeholder="Enter question text"
          value={currentQuestion.question}
          onChange={(e) =>
            setCurrentQuestion({ ...currentQuestion, question: e.target.value })
          }
        ></textarea>

        {currentQuestion.options.map((opt, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              className="flex-1 border p-2 rounded"
              placeholder={`Option ${index + 1}`}
              value={opt}
              onChange={(e) => {
                const newOptions = [...currentQuestion.options];
                newOptions[index] = e.target.value;
                setCurrentQuestion({
                  ...currentQuestion,
                  options: newOptions,
                });
              }}
            />
            <button
              className={`px-3 py-1 rounded text-white ${
                currentQuestion.correctAnswers.includes(index)
                  ? "bg-green-600"
                  : "bg-gray-400"
              }`}
              onClick={() => toggleCorrectAnswer(index)}
            >
              ✓
            </button>
          </div>
        ))}

        {currentQuestion.options.length < 5 && (
          <button
            className="text-blue-600 text-sm underline mb-2"
            onClick={handleAddOption}
          >
            + Add Option
          </button>
        )}

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleAddQuestion}
        >
          Add Question
        </button>
      </div>

      {/* Questions Preview */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Questions ({questions.length})
        </h2>
        {questions.map((q, i) => (
          <div key={i} className="border p-3 rounded mb-2">
            <p className="font-medium">{i + 1}. {q.question}</p>
            <ul className="list-disc ml-5 text-gray-600">
              {q.options.map((opt, idx) => (
                <li key={idx}>
                  {opt}
                  {q.correctAnswers.includes(idx) && (
                    <span className="text-green-600 ml-2">(Correct)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Save / Update */}
      <div className="flex justify-center gap-4">
        <button
          className="bg-green-600 text-white px-6 py-2 rounded"
          onClick={handleSavePaper}
        >
          Save Paper
        </button>
        <button
          className="bg-yellow-500 text-white px-6 py-2 rounded"
          onClick={handleEditPaper}
        >
          Update Paper
        </button>
      </div>
    </div>
  );
};

export default AdminAddQuestion;
