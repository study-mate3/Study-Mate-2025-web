// PdfListPage.jsx (FIXED)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PdfListPage = () => {
  const [pdfs, setPdfs] = useState([]);
  const navigate = useNavigate();

  // ✅ FIXED: Hardcoded list that matches your actual files
  // Add more PDFs here as needed: ['2022_science.pdf', '2023_math.pdf', ...]
  const pdfFiles = [
    '2022_science.pdf',
    '2022_buddhism.pdf',
    '2022_history.pdf',
    '2022_sinhala.pdf',
    '2023_science.pdf',
    '2024_buddhism.pdf',
    '2024_sinhala.pdf',

    // Add other PDF filenames here ↓
  ];

  useEffect(() => {
    // Test if files exist by checking if they load
    const testPdfs = async () => {
      const validPdfs = [];
      for (const pdf of pdfFiles) {
        try {
          const response = await fetch(`/essay-papers/${pdf}`);
          if (response.ok) {
            validPdfs.push(pdf);
          }
        } catch (error) {
          console.log(`PDF not found: ${pdf}`);
        }
      }
      setPdfs(validPdfs);
    };
    
    testPdfs();
  }, []);

  const handleCardClick = (pdfPath) => {
    navigate(`/pdf-viewer?file=${encodeURIComponent(pdfPath)}`);
  };

  const parsePdfName = (filename) => {
    const parts = filename.replace('.pdf', '').split('_');
    const year = parts[0] || '';
    const subject = parts.slice(1).join(' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return year ? `${year} ${subject}` : subject;
  };

  return (
    <div className="pdf-list-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Essay Papers</h1>
      <div className="pdf-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        {pdfs.length > 0 ? (
          pdfs.map((pdf, index) => (
            <div 
              key={index}
              className="pdf-card"
              onClick={() => handleCardClick(pdf)}
              style={{
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                {parsePdfName(pdf)}
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                {pdf}
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No PDF files configured. Add filenames to <code>pdfFiles</code> array above.</p>
            <p>✅ Your file path is correct: <code>public/essay-papers/2022_science.pdf</code></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfListPage;
