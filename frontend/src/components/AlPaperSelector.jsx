import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const mediums = ["English", "Sinhala", "Tamil"];

const ALPaperSelector = () => {
  const category = "al";
  const [papers, setPapers] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMedium, setSelectedMedium] = useState(null);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMediumOpen, setIsMediumOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  // 🔹 Fetch all papers from Firestore
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const papersRef = collection(db, "papers", "al", "papersList");
        const snapshot = await getDocs(papersRef);
        const papersArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPapers(papersArray);
      } catch (error) {
        console.error("Error fetching papers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  // 🔹 Get unique years from papers
  const years = Array.from(new Set(papers.map((p) => p.year))).sort(
    (a, b) => b - a
  );

  // 🔹 Filter papers based on selections
  const filteredPapers = papers.filter((paper) => {
    return (
      (selectedYear ? paper.year === selectedYear : true) &&
      (selectedMedium ? paper.medium === selectedMedium : true)
    );
  });

  if (loading) {
    return <p className="text-center mt-10">Loading papers...</p>;
  }

  return (
    <div className="p-6">
      {/* 🔹 Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {/* Year Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsYearOpen(!isYearOpen)}
            className="w-full sm:w-[130px] rounded-full text-white text-sm sm:text-base font-semibold py-2 px-4 shadow bg-gradient-to-b from-[#0570B2] to-[#176BE8]"
          >
            {selectedYear ? selectedYear : "Select Year"}
          </button>
          {isYearOpen && (
            <div className="absolute mt-1 bg-white border rounded shadow z-10">
              {years.map((year) => (
                <div
                  key={year}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => {
                    setSelectedYear(year);
                    setIsYearOpen(false);
                  }}
                >
                  {year}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medium Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsMediumOpen(!isMediumOpen)}
            className="w-full sm:w-[160px] rounded-full text-white text-sm sm:text-base font-semibold py-2 px-4 shadow bg-gradient-to-b from-[#0570B2] to-[#176BE8]"
          >
            {selectedMedium ? selectedMedium : "Select Medium"}
          </button>
          {isMediumOpen && (
            <div className="absolute mt-1 bg-white border rounded shadow z-10">
              {mediums.map((med) => (
                <div
                  key={med}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => {
                    setSelectedMedium(med);
                    setIsMediumOpen(false);
                  }}
                >
                  {med}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Papers Grid */}
      {filteredPapers.length === 0 ? (
        <p className="text-center text-gray-500">No papers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredPapers.map((paper, idx) => (
            <div
            key={idx}
            onClick={() => navigate(`/quiz/${category}/${paper.id}/instructions`)}  // ✅ Go to quiz page
            className="border rounded p-4 flex flex-col items-start hover:shadow-lg transition cursor-pointer"
          >
            <img
              src={paper.icon || "/default.png"}
              alt={paper.subject}
              className="w-10 h-10 mb-2"
            />
            <h3 className="font-semibold text-lg">
              {`${paper.year} O/L ${paper.subject}`}
            </h3>
            <p className="text-md text-gray-500">{paper.medium} Medium</p>
          </div>

          ))}
        </div>
      )}
    </div>
  );
};

export default ALPaperSelector;
