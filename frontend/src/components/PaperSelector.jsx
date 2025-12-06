import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const mediums = ["English", "Sinhala", "Tamil"];
const paperTypes = ["MCQ", "Essay"];

const PaperSelector = () => {
  const category = "ol";
  const [papers, setPapers] = useState([]);
  const [essayPdfs, setEssayPdfs] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMedium, setSelectedMedium] = useState(null);
  const [selectedPaperType, setSelectedPaperType] = useState("MCQ");
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMediumOpen, setIsMediumOpen] = useState(false);
  const [isPaperTypeOpen, setIsPaperTypeOpen] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ Always starts with loading
  const navigate = useNavigate();

  // 🔹 Fetch MCQ papers from Firestore
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const papersRef = collection(db, "papers", "ol", "papersList");
        const snapshot = await getDocs(papersRef);
        const papersArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPapers(papersArray);
      } catch (error) {
        console.error("Error fetching papers:", error);
        setPapers([]); // ✅ Empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  // 🔹 Fetch Essay PDFs (always loads instantly)
  useEffect(() => {
    const pdfFiles = [
      '2022_science.pdf',
      '2022_buddhism.pdf',
      '2022_history.pdf',
      '2022_sinhala.pdf',
      '2023_science.pdf',
      '2024_buddhism.pdf',
      '2024_sinhala.pdf',
      // Add more: '2023_math.pdf', etc.
    ];
    setEssayPdfs(pdfFiles);
  }, []);

  // 🔹 Show loading ALWAYS until both data sources are ready
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          {/* Show dropdowns even during loading */}
          <div className="relative">
            <button className="w-full sm:w-[130px] rounded-full text-white text-sm sm:text-base font-semibold py-2 px-4 shadow bg-gradient-to-b from-[#0570B2] to-[#176BE8] opacity-50 cursor-not-allowed">
              Select Year
            </button>
          </div>
          <div className="relative">
            <button className="w-full sm:w-[160px] rounded-full text-white text-sm sm:text-base font-semibold py-2 px-4 shadow bg-gradient-to-b from-[#0570B2] to-[#176BE8] opacity-50 cursor-not-allowed">
              Select Medium
            </button>
          </div>
          <div className="relative">
            <button className="w-full sm:w-[120px] rounded-full text-white text-sm sm:text-base font-semibold py-2 px-4 shadow bg-gradient-to-b from-[#0570B2] to-[#176BE8] opacity-50 cursor-not-allowed">
              MCQ
            </button>
          </div>
        </div>
        
        {/* ✅ Always show loading papers message */}
        <div className="text-center mt-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0570B2] mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading papers...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching MCQ papers and essay PDFs</p>
        </div>
      </div>
    );
  }

  // 🔹 Get unique years from papers
  const years = Array.from(new Set(papers.map((p) => p.year))).sort(
    (a, b) => b - a
  );

  // 🔹 Filter MCQ papers based on selections
  const filteredPapers = papers.filter((paper) => {
    return (
      (selectedYear ? paper.year === selectedYear : true) &&
      (selectedMedium ? paper.medium === selectedMedium : true)
    );
  });

  // 🔹 Filter Essay PDFs by year (if selected)
  const filteredEssayPdfs = essayPdfs.filter((pdf) => {
    if (!selectedYear) return true;
    const yearMatch = pdf.match(/^\d{4}/);
    return yearMatch && parseInt(yearMatch[0]) === selectedYear;
  });

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

        {/* Paper Type Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsPaperTypeOpen(!isPaperTypeOpen)}
            className="w-full sm:w-[120px] rounded-full text-white text-sm sm:text-base font-semibold py-2 px-4 shadow bg-gradient-to-b from-[#0570B2] to-[#176BE8]"
          >
            {selectedPaperType}
          </button>
          {isPaperTypeOpen && (
            <div className="absolute mt-1 bg-white border rounded shadow z-10">
              {paperTypes.map((type) => (
                <div
                  key={type}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => {
                    setSelectedPaperType(type);
                    setIsPaperTypeOpen(false);
                  }}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Content based on Paper Type */}
      {selectedPaperType === "MCQ" ? (
        filteredPapers.length === 0 ? (
          <p className="text-center text-gray-500">No MCQ papers found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPapers.map((paper, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/quiz/${category}/${paper.id}/instructions`)} 
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
        )
      ) : (
        filteredEssayPdfs.length === 0 ? (
          <p className="text-center text-gray-500">No Essay papers found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredEssayPdfs.map((pdf, idx) => {
              const parsePdfName = (filename) => {
                const parts = filename.replace('.pdf', '').split('_');
                const year = parts[0] || '';
                const subject = parts.slice(1).join(' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return year ? `${year} ${subject}` : subject;
              };

              return (
                <div
                  key={idx}
                  onClick={() => navigate(`/pdf-viewer?file=${encodeURIComponent(pdf)}`)}
                  className="border rounded p-4 flex flex-col items-start hover:shadow-lg transition cursor-pointer bg-white"
                  style={{
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  <h3 className="font-semibold text-lg">
                    {parsePdfName(pdf)}
                  </h3>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    📄 Essay Paper
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default PaperSelector;
