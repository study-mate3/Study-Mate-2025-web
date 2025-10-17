import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const LastSessionSummary = ({ userId }) => {
  const [sessionSummary, setSessionSummary] = useState(null);

  useEffect(() => {
    const fetchSessionSummary = async () => {
      if (!userId) return;
      try {
        const pointsDocRef = doc(db, "users", userId, "rewards", "points");
        const docSnap = await getDoc(pointsDocRef);
        if (docSnap.exists()) {
          setSessionSummary(docSnap.data().sessionSummary);
        }
      } catch (error) {
        console.error("Error fetching session summary:", error);
      }
    };

    fetchSessionSummary();
  }, [userId]);

  if (!sessionSummary) return <p>Loading session summary...</p>;

  return (
    <div className="p-4 border  bg-white max-w-2xl" style={{
        background: 'white',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        borderRadius: 10,
        border: '0.02px solid rgba(154, 157, 161, 0.38)',
      }}>
       <h2 className="text-lg" style={{fontFamily: '"Inter", sans-serif', fontWeight: '600', fontSize:'20px'}}>Your Last Session Progress - See How You Did! </h2>
      <ul className="space-y-1 mt-5 lg:text-sm">
      <li><strong>✍🏻 Session Activity:</strong> {sessionSummary.sessionActivity}</li>
      <li><strong>✍🏻 Total Pomodoros for completion:</strong> {sessionSummary.totalPomodoro}</li>
        <li><strong>🎯 Focus:</strong> {sessionSummary.focus}/5</li>
        <li><strong>📈 Productivity:</strong> {sessionSummary.productivity}/5</li>
        <li><strong>💡 Understanding:</strong> {sessionSummary.understanding}/5</li>
        <li><strong>🕜 Timestamp:</strong> {new Date(sessionSummary.timestamp).toLocaleString()}</li>
      </ul>
    </div>
  );
};

export default LastSessionSummary;
