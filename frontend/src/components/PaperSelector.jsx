import { useState } from 'react';

const papersData = [
  { year: 2017, subject: 'History', medium: 'English', icon: '/history.png' },
  { year: 2017, subject: 'Science', medium: 'English', icon: '/science.png' },
  { year: 2017, subject: 'Buddhism', medium: 'English', icon: '/buddhism.png' },
  { year: 2017, subject: 'Sinhala', medium: 'Sinhala', icon: '/sinhala.png' },
  { year: 2017, subject: 'Maths', medium: 'English', icon: '/maths.png' },
  { year: 2017, subject: 'Art', medium: 'Sinhala', icon: '/art.png' },
  { year: 2016, subject: 'History', medium: 'English', icon: '/history.png' },
  { year: 2016, subject: 'Science', medium: 'English', icon: '/science.png' },
  { year: 2016, subject: 'Buddhism', medium: 'English', icon: '/buddhism.png' },
  { year: 2016, subject: 'Sinhala', medium: 'Sinhala', icon: '/sinhala.png' },
  { year: 2016, subject: 'Maths', medium: 'English', icon: '/maths.png' },
  { year: 2016, subject: 'Art', medium: 'Sinhala', icon: '/art.png' },
];

const years = [2017, 2016]; // You can add more years dynamically
const mediums = ['English', 'Sinhala', 'Tamil'];

const PaperSelector = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMedium, setSelectedMedium] = useState(null);

  const filteredPapers = papersData.filter(paper => {
    return (
      (selectedYear ? paper.year === selectedYear : true) &&
      (selectedMedium ? paper.medium === selectedMedium : true)
    );
  });

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative">
          <button className="border px-4 py-2 rounded bg-white shadow">
            {selectedYear ? selectedYear : 'Select Year'}
          </button>
          <div className="absolute mt-1 bg-white border rounded shadow z-10">
            {years.map(year => (
              <div
                key={year}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <button className="border px-4 py-2 rounded bg-white shadow">
            {selectedMedium ? selectedMedium : 'Select Medium'}
          </button>
          <div className="absolute mt-1 bg-white border rounded shadow z-10">
            {mediums.map(med => (
              <div
                key={med}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => setSelectedMedium(med)}
              >
                {med}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredPapers.map((paper, idx) => (
          <div
            key={idx}
            className="border rounded p-4 flex flex-col items-start hover:shadow-lg transition cursor-pointer"
          >
            <img src={paper.icon} alt={paper.subject} className="w-10 h-10 mb-2" />
            <h3 className="font-semibold">{`${paper.year} O/L ${paper.subject}`}</h3>
            <p className="text-sm text-gray-500">{paper.medium} Medium</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaperSelector;
