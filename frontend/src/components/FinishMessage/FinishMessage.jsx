import React from 'react';
import './FinishMessage.css'; // Import a CSS file for styling if needed

export default function FinishMessage({ message, imageSrc, onClose }) {
    return (
        <div className="finish-message-container">
            <div className="finish-message">
                <img src={imageSrc} alt="Finish" className="finish-image" />
                <p className="finish-text">{message}</p>
                <button className="close-button" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}
