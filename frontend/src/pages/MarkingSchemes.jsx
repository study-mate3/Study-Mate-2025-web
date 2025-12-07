// MarkingSchemes.jsx (Updated for local PDFs)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidePanel from '../components/SidePanel';
import logo2 from '/whitelogo.png';

const MarkingSchemes = () => {
  const sidePanelStyle = {
    position: 'fixed',
    left: -10,
    top: '200px',
  };

  const navigate = useNavigate();
  
  // Mock data - matches your public/marking_schemes/ folder structure
  const mockSchemes = [
    { year: 2022, subject: 'Sinhala', medium: 'Sinhala', type: 'OL', fileName: '2022_OL_sinhala.pdf' },
    { year: 2022, subject: 'Science', medium: 'Sinhala', type: 'OL', fileName: '2022_OL_science.pdf' },
    { year: 2022, subject: 'Mathematics', medium: 'English', type: 'OL', fileName: '2022_OL_mathematics_english.pdf' },
    { year: 2023, subject: 'History', medium: 'Sinhala', type: 'AL', fileName: '2023_AL_history_sinhala.pdf' },
    { year: 2023, subject: 'Buddhism', medium: 'Sinhala', type: 'OL', fileName: '2023_OL_buddhism_sinhala.pdf' },
    { year: 2023, subject: 'English', medium: 'English', type: 'AL', fileName: '2023_AL_english.pdf' },
    { year: 2024, subject: 'Mathematics', medium: 'Sinhala', type: 'AL', fileName: '2024_AL_mathematics_sinhala.pdf' },
    { year: 2024, subject: 'Science', medium: 'Tamil', type: 'OL', fileName: '2024_OL_science_tamil.pdf' },
    { year: 2024, subject: 'Sinhala', medium: 'Sinhala', type: 'AL', fileName: '2024_AL_sinhala.pdf' },
  ];

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMedium, setSelectedMedium] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMediumOpen, setIsMediumOpen] = useState(false);
  const [isLevelOpen, setIsLevelOpen] = useState(false);

  // Available options
  const years = Array.from(new Set(mockSchemes.map(s => s.year))).sort((a, b) => b - a);
  const mediums = Array.from(new Set(mockSchemes.map(s => s.medium))).sort();
  const levels = ['AL', 'OL'];

  // Filter schemes
  const filteredSchemes = mockSchemes.filter(scheme => {
    return (
      (selectedYear ? scheme.year === selectedYear : true) &&
      (selectedMedium ? scheme.medium === selectedMedium : true) &&
      (selectedLevel ? scheme.type === selectedLevel : true)
    );
  });

  const openPdfViewer = (fileName) => {
    navigate(`/marking-pdf-viewer?file=${encodeURIComponent(fileName)}`);
  };

  return (
    <div className="min-h-screen">
      <div style={sidePanelStyle}>
        <SidePanel />
      </div>
      
      {/* Header - Same design */}
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
            Marking Schemes
          </h2>
          <img src="/quiz.png" alt="Quiz" className="w-20 h-20 lg:w-24 lg:h-24" />
        </div>
      </div>

      <div className="lg:p-6 max-w-4xl lg:mt-20 mx-auto p-20">
        <div className="p-6">
          {/* Filters - Same design as PaperSelector */}
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
                <div className="absolute mt-1 bg-white border rounded shadow z-10 w-[130px]">
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
                <div className="absolute mt-1 bg-white border rounded shadow z-10 w-[160px]">
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

            {/* Level Dropdown (AL/OL) */}
            <div className="relative">
              <button
                onClick={() => setIsLevelOpen(!isLevelOpen)}
                className="w-full sm:w-[120px] rounded-full text-white text-sm sm:text-base font-semibold py-2 px-4 shadow bg-gradient-to-b from-[#0570B2] to-[#176BE8]"
              >
                {selectedLevel || "AL/OL"}
              </button>
              {isLevelOpen && (
                <div className="absolute mt-1 bg-white border rounded shadow z-10 w-[120px]">
                  {levels.map((level) => (
                    <div
                      key={level}
                      className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => {
                        setSelectedLevel(level);
                        setIsLevelOpen(false);
                      }}
                    >
                      {level}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Schemes Grid - Same design */}
          {filteredSchemes.length === 0 ? (
            <p className="text-center text-gray-500">No marking schemes found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredSchemes.map((scheme, idx) => (
                <div
                  key={idx}
                  onClick={() => openPdfViewer(scheme.fileName)}
                  className="border rounded p-4 flex flex-col items-start hover:shadow-lg transition cursor-pointer bg-white"
                  style={{
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-600 font-medium text-sm">Marking Scheme</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">
                    {scheme.subject}
                  </h3>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    {scheme.year} {scheme.type} - {scheme.medium} Medium
                  </div>
                  <div className="mt-2 flex items-center text-blue-600 text-sm font-medium">
                    📄 View PDF 
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkingSchemes;
