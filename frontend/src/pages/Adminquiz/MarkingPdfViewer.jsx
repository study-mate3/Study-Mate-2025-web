// MarkingPdfViewer.jsx - Separate file for marking schemes
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MarkingPdfViewer = () => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(11400); // 60 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const file = params.get('file');
    if (file) {
      setPdfUrl(`/marking_schemes/${decodeURIComponent(file)}`); // ✅ Marking folder
    }
  }, [location.search]);

  // Timer logic (same as PdfViewerPage)
  useEffect(() => {
    let interval;
    if (isTimerRunning && !isTimerPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            alert('Time is up!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isTimerPaused, timeLeft]);

 

  if (!pdfUrl) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No Marking Scheme selected</h2>
        <button 
          onClick={() => navigate('/marking-schemes')}
          style={{ 
            padding: '10px 30px', 
            fontSize: '16px', 
            background: '#1e3a8a', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Back to Marking Schemes
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      {/* SAME TOP TIMER BAR - MARKING TITLE */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 30px',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(45deg, #3b82f6, #60a5fa)',
            borderRadius: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            <img 
              src="/icons/logo.jpg"
              alt="Marking"
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'contain',
                borderRadius: '60px',
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Marking Scheme</div>
            <div style={{ fontSize: '10px', opacity: '0.9' }}>
              Source: Department of Examinations, Sri Lanka.<br/>
              Provided via StudyMate for educational use only.
            </div>
          </div>
        </div>

       
      </div>

      {/* PDF Viewer */}
      <div style={{
        height: '100vh',
        paddingTop: '80px',
        overflow: 'auto'
      }}>
        <iframe
          src={pdfUrl}
          style={{
            width: '100%',
            height: '100%',
            minHeight: 'calc(100vh - 80px)',
            border: 'none',
            display: 'block'
          }}
          title="Marking Scheme PDF"
        />
      </div>
    </div>
  );
};

export default MarkingPdfViewer;
