import React, { useState } from 'react';
import './SliderCustomizationBox.css'; // Import the CSS file for styling

const SliderCustomizationBox = ({ onClose, onSelect }) => {
    const [pomodoroTime, setPomodoroTime] = useState(20 * 60 * 1000); // 20 minutes
    const [breakTime, setBreakTime] = useState(5 * 60 * 1000); // 5 minutes
    const [longBreakTime, setLongBreakTime] = useState(15 * 60 * 1000); // 15 minutes

    const handlePomodoroChange = (e) => {
        const minutes = parseInt(e.target.value, 10); // Ensure value is an integer
        console.log('Pomodoro minutes:', minutes);
        setPomodoroTime(minutes * 60 * 1000); // Convert minutes to milliseconds
    };

    const handleBreakChange = (e) => {
        const minutes = parseInt(e.target.value, 10); // Ensure value is an integer
        console.log('Break minutes:', minutes);
        setBreakTime(minutes * 60 * 1000); // Convert minutes to milliseconds
    };

    const handleLongBreakChange = (e) => {
        const minutes = parseInt(e.target.value, 10); // Ensure value is an integer
        console.log('Long Break minutes:', minutes);
        setLongBreakTime(minutes * 60 * 1000); // Convert minutes to milliseconds
    };

    const handleSave = () => {
        console.log('Saving times:', pomodoroTime, breakTime, longBreakTime);
        onSelect(pomodoroTime, breakTime, longBreakTime);
        onClose();
    };

    return (
        <div className="slider-customization-box">
            <div className="box-header" style={{fontFamily: "'Inter', sans-serif"}} >
                Custom
            </div>
            
            <div className="scb-content">
                <div className="slider-row">
                    <label className='pomo' style={{fontFamily: "'Inter', sans-serif"}} >Pomodoro (minutes):</label>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={pomodoroTime / 60 / 1000} // Convert milliseconds to minutes
                        onChange={handlePomodoroChange}
                        className="slider"
                        
                    />
                    <span className='timespan' style={{fontFamily: "'Inter', sans-serif"}} >{pomodoroTime / 60 / 1000} min</span>
                </div>
                <div className="slider-row">
                    <label className='break' style={{fontFamily: "'Inter', sans-serif"}} >Break (minutes):</label>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={breakTime / 60 / 1000} // Convert milliseconds to minutes
                        onChange={handleBreakChange}
                        className="slider"
                    />
                    <span className='timespan' style={{fontFamily: "'Inter', sans-serif"}} >{breakTime / 60 / 1000} min</span>
                </div>
                <div className="slider-row">
                    <label className='longbreak' style={{fontFamily: "'Inter', sans-serif"}} >Long Break (minutes):</label>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={longBreakTime / 60 / 1000} // Convert milliseconds to minutes
                        onChange={handleLongBreakChange}
                        className="slider"
                    />
                    <span className='timespan' style={{fontFamily: "'Inter', sans-serif"}} >{longBreakTime / 60 / 1000} min</span>
                </div>
            </div>

            <button className="save-btn" style={{fontFamily: "'Inter', sans-serif"}} onClick={handleSave}>Save</button>
        </div>
    );
};

export default SliderCustomizationBox;
