import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import SidePanel from "../components/SidePanel";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();
import logo2 from '/whitelogo.png'


export default function QuizGenerator() {
  const [pdfText, setPdfText] = useState("");
  const [difficulty, setDifficulty] = useState("simple");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState("mcq");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);

  // Quiz-taking states
  const [studentAnswers, setStudentAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [readyToTake, setReadyToTake] = useState(false); 
  const [essayFeedback, setEssayFeedback] = useState("");

  // Handle file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let textContent = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        const pageText = text.items.map((s) => s.str).join(" ");
        textContent += pageText + "\n";
      }
      setPdfText(textContent);
    };
    reader.readAsArrayBuffer(file);
  };

  // Generate quiz
  const handleGenerate = async () => {
    if (!pdfText) {
      alert("Please upload a PDF first");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: pdfText,
          numQuestions,
          difficulty,
          questionType,
        }),
      });

      const data = await res.json();
      if (data.quiz && data.quiz.questions) {
        setQuiz(data.quiz);
        setStudentAnswers({});
        setSubmitted(false);
        setScore(0);
        setReadyToTake(false); // reset
      } else {
        setQuiz(null);
      }
    } catch (err) {
      console.error(err);
      alert("Error generating quiz");
    } finally {
      setLoading(false);
    }
  };

  // Handle answers
  const handleAnswer = (qIndex, answer) => {
    setStudentAnswers((prev) => ({ ...prev, [qIndex]: answer }));
  };

  // Submit
 const handleSubmitQuiz = async () => {
  let correctCount = 0;
  let essayResults = [];

  for (let i = 0; i < quiz.questions.length; i++) {
    const q = quiz.questions[i];
    const ans = studentAnswers[i];

    if (q.options) {
      // MCQ grading
      if (ans === q.correct_answer) correctCount++;
    } else if (ans) {
      // Essay grading via backend
      try {
        const res = await fetch("http://localhost:5000/api/grade-essay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q.question,
            studentAnswer: ans,
            sampleAnswer: q.sample_answer,
          }),
        });
        const data = await res.json();
        essayResults.push({ question: q.question, evaluation: data.evaluation });
      } catch (err) {
        console.error("Essay grading failed", err);
        essayResults.push({ question: q.question, evaluation: "❌ Could not grade" });
      }
    }
  }

  setScore(correctCount);
  setSubmitted(true);
  setEssayFeedback(essayResults); // 👈 new state
};
const sidePanelStyle = {
    position: 'fixed',
    left: -10,
    top: '200px',
  };
 

  return (
    <div className="lg:p-6 max-w-4xl lg:mt-20 mx-auto p-20" >
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
               Quiz Generator
                </h2>
                <img src="/quizgen.png" alt="Quiz" className="w-20 h-20 lg:w-24 lg:h-24" /></div>
              </div>
        
        
    <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Generate Quizzes from Your Notes</h2>
            <p className="text-sm mb-4 text-blue-600">Just upload your PDF notes, pick how tricky you want the quiz to be, choose the number of questions, and select the quiz type. Your personalized quiz is ready to help you practice and test your knowledge.</p>

      <p></p>
      {/* Upload & settings */}
      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      <div className="mt-4 space-y-3">
        <div>
          <label className="block">Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="simple">Simple</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block">Number of Questions:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block">Question Type:</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="mcq">Multiple Choice</option>
            <option value="essay">Essay</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Generating..." : "Generate Quiz"}
      </button>

      {/* Show Take Quiz button */}
      {quiz && !readyToTake && (
        <div className="mt-6 text-center p-6 border rounded-lg bg-gray-50 shadow-sm">
          <h3 className="text-lg font-semibold">✅ Quiz is ready!</h3>
          <p className="text-gray-600 mb-4">
            Click below when you’re ready to start.
          </p>
          <button
            onClick={() => setReadyToTake(true)}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            🚀 Take Quiz
          </button>
        </div>
      )}

      {/* Quiz section */}
      {quiz && readyToTake && quiz.questions && (
        <div className="mt-6 space-y-6">
          <h3 className="text-lg font-bold">📝 Take the Quiz</h3>

          {quiz.questions.map((q, index) => (
           <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
    <h4 className="font-semibold mb-3">
      {index + 1}. {q.question}
    </h4>

    {q.options ? (
      // MCQ question
      <ul className="space-y-2">
  {q.options.map((opt, i) => {
    const isSelected = studentAnswers[index] === opt;
    const isCorrect = q.correct_answer === opt;

    return (
      <li
        key={i}
        onClick={() => !submitted && handleAnswer(index, opt)}
        className={`p-2 border rounded cursor-pointer transition ${
          !submitted && isSelected ? "bg-blue-100" : ""
        }
        ${submitted && isCorrect ? "bg-green-100 border-green-500" : ""}
        ${submitted && isSelected && !isCorrect ? "bg-red-100 border-red-500" : ""}`}
      >
        {opt}
        {submitted && isCorrect && (
          <span className="ml-2 text-green-600 font-medium">✔</span>
        )}
        {submitted && isSelected && !isCorrect && (
          <span className="ml-2 text-red-600 font-medium">✘</span>
        )}
      </li>
    );
  })}
</ul>

    ) : (
      // Essay question
      <textarea
        className="w-full border p-2 rounded"
        placeholder="Write your answer..."
        rows={4}
        value={studentAnswers[index] || ""}
        onChange={(e) =>
          setStudentAnswers((prev) => ({
            ...prev,
            [index]: e.target.value,
          }))
        }
        disabled={submitted}
      />
    )}
  </div>
          ))}

          {!submitted ? (
            <button
              onClick={handleSubmitQuiz}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
            >
              Submit Quiz
            </button>
          ) : (
            <div className="mt-6 p-4 border rounded bg-gray-50">
              <h3 className="text-lg font-bold">📊 Results</h3>
              <p>
                You scored <b>{score}</b> out of {quiz.questions.length}
              </p>
              <p className="mt-2">
                {score / quiz.questions.length >= 0.7
                  ? "🎉 Great job! You understood the material well."
                  : "📖 Keep practicing! Review the material and try again."}
              </p>
            </div>
          )}
        </div>
      )} {submitted && (
  <div className="mt-6 p-4 border rounded bg-gray-50">
    <h3 className="text-lg font-bold">📊 Results</h3>
    <p>
      MCQ Score: <b>{score}</b> / {quiz.questions.filter(q => q.options).length}
    </p>

    {essayFeedback.length > 0 && (
      <div className="mt-4">
        <h4 className="font-semibold">📝 Essay Feedback</h4>
        {essayFeedback.map((fb, i) => (
          <div key={i} className="mt-2 p-2 border rounded bg-white">
            <p className="font-medium">Q: {fb.question}</p>
            <p className="text-sm text-gray-700">{fb.evaluation}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)}

    </div>
    </div>
  );
}
