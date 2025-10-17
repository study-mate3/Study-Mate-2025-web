import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import Alert from "./Alert";

const ReportIssue = ({ userId  }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [issueDetails, setIssueDetails] = useState({});
const [showAlert, setShowAlert] = useState(false);
const [alertMessage, setAlertMessage] = useState("");

  const togglePopup = () => setIsOpen(!isOpen);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIssueDetails({});
  };

  const handleChange = (e) => {
    setIssueDetails({ ...issueDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    console.log("userId:", userId);
    console.log("issueDetails:", issueDetails);
    if (!selectedCategory || Object.keys(issueDetails).length === 0) {
      alert("Please fill in all required fields.");
      return;
    }
  
    await addDoc(collection(db, "issues"), {
      userId,
      category: selectedCategory,
      details: issueDetails,
      timestamp: new Date(),
    });

    setAlertMessage(`Your issue has been reported! We’ll resolve it ASAP and get back to you.`);
    setShowAlert(true);
    setTimeout(() => navigate("/faq"), 1000);
    setIsOpen(false);
  };

  return (
    <>
      {/* Report Button */}
       {showAlert && <Alert message={alertMessage} onClose={() => setShowAlert(false)} />}
      <button
        className="mt-6 text-white py-2 px-4 font-semibold"
        style={{
          width: 253,
          height: 38,
          background: "#0E3167",
          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
          borderRadius: 100,
        }}
        onClick={togglePopup}
      >
        Facing any issues? Report it!
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white p-6 rounded-lg"
            style={{
              width: "80%",
              height: "80vh",
              overflowY: "auto",
              borderRadius: "20px",
            }}
          >
            <h2 className="text-xl font-bold mb-4">Report an Issue</h2>
            <button 
                className="absolute top-4 right-6 bg-red-600 text-white font-bold rounded-md px-2 py-1 shadow-md hover:bg-red-700 transition"
                onClick={togglePopup}>X</button>

            {/* Category Selection */}
            <div className="mb-4">
              <label className="block font-semibold">Select Your Issue:</label>
              <select
                className="border p-2 w-full mt-2"
                onChange={(e) => handleCategorySelect(e.target.value)}
              >
                <option value="">-- Choose --</option>
                <option value="Parent/Account Issues">🔹 Parent/Account Issues</option>
                <option value="App Issues">🔹 App Issues</option>
                <option value="Request Quiz">🔹 Request Quiz</option>
                <option value="Other Issues">🔹 Other Issues</option>
              </select>
            </div>

            {/* Dynamic Issue Form */}
            {selectedCategory === "Parent/Account Issues" && (
              <>
                <label>Parent’s Name (from email):</label>
                <input type="text" name="parentName" className="border p-2 w-full" onChange={handleChange} />
                <label>Email Received Time:</label>
                <input type="text" name="emailTime" className="border p-2 w-full" onChange={handleChange} />
                <label>Email Received Date:</label>
                <input type="text" name="emailDate" className="border p-2 w-full" onChange={handleChange} />
              </>
            )}

            {selectedCategory === "App Issues" && (
              <>
                <label>Issue Type:</label>
                <select name="appIssue" className="border p-2 w-full" onChange={handleChange}>
                  <option value="">-- Select --</option>
                  <option value="Timer not working">Timer not working</option>
                  <option value="To-Do List issue">To-Do List issue</option>
                  <option value="Notification problem">Notification problem</option>
                </select>
              </>
            )}
             {selectedCategory === "Request Quiz" && (
              <>
                <label>Academic Level:</label>
                <select name="grade" className="border p-2 w-full" onChange={handleChange}>
                  <option value="">-- Select --</option>
                  <option value="Grade 6-9">Grade 6-9</option>
                  <option value="Grade 10-11">Grade 10-11</option>
                  <option value="Grade 12-13">Grade 12-13</option>
                  <option value="University">University</option>
                </select>
                <label>Subject and Topics:</label>
                <textarea name="Subject" className="border p-2 w-full" onChange={handleChange}></textarea>
              </>
            )}

            {selectedCategory === "Other Issues" && (
              <>
                <label>Describe Your Issue:</label>
                <textarea name="otherIssue" className="border p-2 w-full" onChange={handleChange}></textarea>
              </>
            )}

            {/* Submit Button */}
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handleSubmit}
            >
              Submit Issue
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportIssue;
