import { useNavigate } from "react-router-dom";
const navigate = useNavigate();

// inside .map((paper) => ...)
<div
  key={idx}
  className="border rounded p-4 hover:shadow-lg transition cursor-pointer flex flex-col items-start"
>
  <img src={paper.icon} alt={paper.subject} className="w-10 h-10 mb-2" />
  <h3 className="font-semibold">{`${paper.year} O/L ${paper.subject}`}</h3>
  <p className="text-sm text-gray-500">{paper.medium} Medium</p>

  <button
    className="bg-blue-600 text-white px-3 py-1 mt-3 rounded"
    onClick={() => navigate(`/quiz/${paper.year}_${paper.subject.toLowerCase()}_${paper.medium.toLowerCase()}`)}
  >
    Start Quiz
  </button>
</div>
