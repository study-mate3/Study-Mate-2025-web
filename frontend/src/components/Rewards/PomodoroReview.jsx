import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebaseConfig"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Alert from "../Alert";
import { toast } from "react-toastify";

const PomodoroReview = () => {
  const [focus, setFocus] = useState(0);
  const [productivity, setProductivity] = useState(0);
  const [understanding, setUnderstanding] = useState(0);
  const user = auth.currentUser; // Get the current user
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
  }, [user]);

  const handleSubmit = async () => {
    if (focus === 0 || productivity === 0 || understanding === 0) {
      alert("Please rate all questions before submitting.");
      return;
    }

    const totalPoints = focus + productivity + understanding;
    const userRef = doc(db, "users", user.uid, "rewards", "points");

    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        await updateDoc(userRef, { points: docSnap.data().points + totalPoints });
      } else {
        await setDoc(userRef, { points: totalPoints });
      }
      toast.success("Review submitted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
     
      setAlertMessage(`Review submitted successfully!`);
      setShowAlert(true);
      setTimeout(() => navigate("/timer"), 3000);
    } catch (error) {
      console.error("Error updating points: ", error);
      toast.error(`Error updating points: ${error.message}`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            setAlertMessage(`Error updating points: ${error.message}`);
            setShowAlert(true);

    }
  };

  return (
    <div>
            {showAlert && <Alert message={alertMessage} onClose={() => setShowAlert(false)} />}

    <div className="flex flex-col items-center p-6 bg-white w-full rounded-lg shadow-md max-w-4xl mx-auto">
           <div className=" flex justify-center items-center mt-6">
                        <div className="w-[160px]"><img src="scrolledLogo.png" alt="" /></div>
                      </div>
      <h2 className="text-3xl font-bold mb-10 mt-4">🔍 Quick Self-Check: Review Your Pomodoro Session!</h2>
      
      <Question title="1. How focused were you during this session?" rating={focus} setRating={setFocus} />
      <Question title="2. How productive was your study session?" rating={productivity} setRating={setProductivity} />
      <Question title="3. How much did you understand from what you studied?" rating={understanding} setRating={setUnderstanding} />
      
      <div className="flex justify-between w-full mt-4">
        <button className="bg-gray-400 text-white px-4 py-2 rounded-md" onClick={() => navigate('/timer')}>Skip</button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
    </div>
  );
};

const Question = ({ title, rating, setRating }) => {
  return (
    <div className="w-full mb-8">
      <p className="mb-3 font-medium text-lg">{title}</p>
      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setRating(num)}
            className={`px-3 py-1 rounded-full ${rating >= num ? "bg-yellow-400" : "bg-gray-200"}`}
          >
            ⭐
          </button>
        ))}
      </div>
    </div>
  );
};

export default PomodoroReview;
