import React, { useState } from 'react';
import './CustomTimerBox.css'; // Import the CSS file


const CustomTimerBox = ({ onClose, onSelect }) => {
    const [isSliderCustomizing, setIsSliderCustomizing] = useState(false);

    const handleSelect = (pomodoroTime, breakTime, longBreakTime) => {
        onSelect(pomodoroTime, breakTime, longBreakTime);
        onClose();
    };

    const handleSliderCustomizationClick = () => {
        setIsSliderCustomizing(true);
    };

    const handleCloseSliderCustomizationBox = () => {
        setIsSliderCustomizing(false);
    };

    return (
        <div className="custom-timer-box" style={{ fontFamily: "'Inter', sans-serif" }}>
  <div className="box-header" style={{ fontFamily: "'Inter', sans-serif" }}>
    <h3 style={{ fontWeight: 700 }}>Customize Your Timer</h3>
    <button className="close-btn" onClick={onClose} style={{ fontFamily: "'Inter', sans-serif" }}>
      ×
    </button>
  </div>

  <div className="timer-options">
    <div className="option-row">
      {/* Popular Option */}
      <div className="option-column">
        <div
          className="option"
          onClick={() => handleSelect(20 * 60 * 1000, 5 * 60 * 1000, 15 * 60 * 1000)}
        >
          <div className="option-content" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="circle"></div>
            <div className="optionHeading" style={{ fontFamily: "'Inter', sans-serif",fontWeight: 500 }}>
              Popular
            </div>
          </div>
          <div className="details" style={{ fontFamily: "'Inter', sans-serif" }}>
            20 min Pomodoro<br />5 min Break<br />15 min Long Break
          </div>
        </div>
      </div>

      {/* Medium Option */}
      <div className="option-column">
        <div
          className="option"
          onClick={() => handleSelect(40 * 60 * 1000, 8 * 60 * 1000, 20 * 60 * 1000)}
        >
          <div className="option-content" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="circle"></div>
            <div className="optionHeading" style={{ fontFamily: "'Inter', sans-serif",fontWeight: 500 }}>
              Medium
            </div>
          </div>
          <div className="details" style={{ fontFamily: "'Inter', sans-serif" }}>
            40 min Pomodoro<br />8 min Break<br />20 min Long Break
          </div>
        </div>
      </div>

      {/* Extended Option */}
      <div className="option-column">
        <div
          className="option"
          onClick={() => handleSelect(60 * 60 * 1000, 10 * 60 * 1000, 25 * 60 * 1000)}
        >
          <div className="option-content" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="circle"></div>
            <div className="optionHeading" style={{fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              Extended
            </div>
          </div>
          <div className="details" style={{ fontFamily: "'Inter', sans-serif" }}>
            60 min Pomodoro<br />10 min Break<br />25 min Long Break
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    )
};

export default CustomTimerBox;
