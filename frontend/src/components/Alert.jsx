import React, { useState, useEffect } from "react";

const Alert = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Display for 5 seconds

    return () => clearTimeout(timer); // Cleanup timer
  }, [onClose]);

  return (
    <div style={styles.alert}>
      {message}
    </div>
  );
};

const styles = {
  alert: {
    backgroundColor: "blue",
    color: "white",
    padding: "15px 15px",
    borderRadius: "5px",
    textAlign: "center",
    position: "fixed",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
};

export default Alert;
