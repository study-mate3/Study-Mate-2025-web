// PdfViewerPage.jsx (UPDATED - Simple Top Timer)
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PdfViewerPage = () => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(11400); // default 60 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const file = params.get('file');
    if (file) {
      setPdfUrl(`/essay-papers/${decodeURIComponent(file)}`);
    }
  }, [location.search]);

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

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 
      ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      setIsTimerPaused(false);
    } else if (isTimerPaused) {
      setIsTimerPaused(false);
    } else {
      setIsTimerPaused(true);
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setIsTimerPaused(false);
    setTimeLeft(11400); // Reset to 60 minutes
  };

  if (!pdfUrl) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No PDF selected</h2>
        <button onClick={() => navigate('/olquiz')} style={{ 
          padding: '10px 30px', 
          fontSize: '16px', 
          background: '#1e3a8a', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      {/* 🔵 SIMPLE TOP TIMER BAR */}
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
        {/* Logo & Title */}
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
      alt="Start"
      style={{
        width: '60px',
        height: '60px',
        objectFit: 'contain',
        borderRadius: '60px',

      }}
    />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Practice Exam Mode</div>
            <div style={{ fontSize: '10px', opacity: '0.9' }}>Source: Department of Examinations, Sri Lanka.<br></br>
Provided via StudyMate for educational use only.</div>
          </div>
        </div>

        {/* Timer Display */}
        <div style={{
          fontSize: '28px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          minWidth: '130px',
          textAlign: 'center'
        }}>
          {formatTime(timeLeft)}
        </div>

<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
  {/* Start Button */}
  <button
    onClick={() => {
      if (!isTimerRunning) {
        setIsTimerRunning(true);
        setIsTimerPaused(false);
      }
    }}
    disabled={isTimerRunning}
    style={{
      width: '30px',
      height: '30px',
      border: 'none',
      borderRadius: '12px',
      background: isTimerRunning ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
      cursor: isTimerRunning ? 'not-allowed' : 'pointer',
      opacity: isTimerRunning ? 0.6 : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}
  >
    <img 
      src="/icons/start.png"
      alt="Start"
      style={{
        width: '20px',
        height: '20px',
        objectFit: 'contain'
      }}
    />
  </button>

  {/* Pause Button */}
  <button
    onClick={() => {
      if (isTimerRunning && !isTimerPaused) {
        setIsTimerPaused(true);
      }
    }}
    disabled={!isTimerRunning || isTimerPaused}
    style={{
      width: '30px',
      height: '30px',
      border: 'none',
      borderRadius: '12px',
      background: (!isTimerRunning || isTimerPaused) ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b, #d97706)',
      cursor: (!isTimerRunning || isTimerPaused) ? 'not-allowed' : 'pointer',
      opacity: (!isTimerRunning || isTimerPaused) ? 0.6 : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}
  >
    <img 
      src="/icons/pause.png"
      alt="Pause"
      style={{
        width: '20px',
        height: '20px',
        objectFit: 'contain'
      }}
    />
  </button>

  {/* Reset Button */}
  <button
    onClick={resetTimer}
    style={{
      width: '30px',
      height: '30px',
      border: 'none',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #6b7280, #4b5563)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}
  >
    <img 
      src="/icons/reset.png"
      alt="Reset"
      style={{
        width: '20px',
        height: '20px',
        objectFit: 'contain'
      }}
    />
  </button>

  {/* Back Button */}
  <button
    onClick={() => navigate('/olquiz')}
    style={{
      padding: '12px 30px',
      background: 'transparent',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '8px',
      fontWeight: '500',
      cursor: 'pointer',
      fontSize: '14px',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}
  >
    <img 
      src="/icons/back.png"
      alt="Back"
      style={{
        width: '18px',
        height: '18px',
        objectFit: 'contain'
      }}
    />
    Back
  </button>
</div>

      </div>

      {/* PDF Viewer - Fullscreen below timer */}
      <div style={{
        height: '100vh',
        paddingTop: '80px', // Space for fixed timer
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
          title="PDF Viewer"
        />
      </div>
    </div>
  );
};

export default PdfViewerPage;
