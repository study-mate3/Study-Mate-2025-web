import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const AbsentTimesCard = ({ userId }) => {
  const [absentTimes, setAbsentTimes] = useState([]);

  useEffect(() => {
    const fetchAbsentTimes = async () => {
      try {
        if (!userId) {
          console.error("User ID is undefined!");
          return;
        }

        const userDocRef = doc(db, 'users', userId); // Adjust collection name
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setAbsentTimes(userData.absentTime || []); // Default to empty array
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching absent times:", error);
      }
    };

    fetchAbsentTimes();
  }, [userId]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      
      {absentTimes.length === 0 ? (
        <p className="text-gray-600">Great job! You're fully focused. 🥳</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {absentTimes.map((time, index) => (
          <li
            key={index}
            className="p-4  rounded-md shadow-sm border border-red-600"
          >
            <p className="text-gray-800 font-medium">Date: {new Date(time).toLocaleDateString()}</p>
            <p className="text-gray-600">Time: {new Date(time).toLocaleTimeString()}</p>
          </li>
        ))}
      </ul>
      
      )}
    </div>
  );
};

export default AbsentTimesCard;
