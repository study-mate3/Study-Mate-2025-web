import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { db, auth } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; // Import auth state listener
import { CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Chart as ChartJS } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement, // Register point element
  LineElement,  // Register line element
  Title,
  Tooltip,
  Legend
);

const EngagementChart = ({ userId }) => {
  console.log("Received userId in EngagementChart:", userId); 
  const [engagementData, setEngagementData] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null); // Ref to store chart instance

  const timeRanges = [
    { label: "10 PM-2 AM", hours: [22, 23, 0, 1] },  // Explicitly list all hours from 10 PM to 2 AM
    { label: "2-6 AM", hours: [2, 3, 4, 5] },
    { label: "6-10 AM", hours: [6, 7, 8, 9] },
    { label: "10 AM-2 PM", hours: [10, 11, 12, 13] },
    { label: "2-6 PM", hours: [14, 15, 16, 17] },
    { label: "6-10 PM", hours: [18, 19, 20, 21] },
  ];
  
  

  const fetchPresentTime = async (userId) => {
    const docRef = doc(db, "users", userId); // Adjust collection and document path
    const docSnap = await getDoc(docRef);
    console.log("Fetched presentTime:", data);

    if (docSnap.exists()) {
      return docSnap.data().presentTime || [];
    } else {
      console.error("No such document!");
      return [];
    }
  };

  const calculateEngagement = (presentTime) => {
    if (presentTime.length < 2) {
      return Array(timeRanges.length).fill(0); // Not enough data for calculation
    }
  
    const durations = Array(timeRanges.length).fill(0);
    let totalTime = 0;
  
    for (let i = 1; i < presentTime.length; i++) {
      const startTimeStr = presentTime[i - 1];
      const endTimeStr = presentTime[i];
  
      // Extract the hour and minute from the timestamp (24-hour format)
      const startHour = parseInt(startTimeStr.slice(11, 13)); // Extract hour
      const endHour = parseInt(endTimeStr.slice(11, 13)); // Extract hour
      const startMinute = parseInt(startTimeStr.slice(14, 16)); // Extract minute
      const endMinute = parseInt(endTimeStr.slice(14, 16)); // Extract minute
  
      // Convert hours and minutes to floating-point hours
      const startFloatHour = startHour + startMinute / 60;
      const endFloatHour = endHour + endMinute / 60;
  
      // Calculate duration between two timestamps in minutes
      const duration = (endFloatHour - startFloatHour) * 60;
      totalTime += duration;
  
      // Map start time to the correct time range
      timeRanges.forEach((range, index) => {
        const normalizedStart = startFloatHour >= 24 ? startFloatHour - 24 : startFloatHour; // Handle hours past midnight (e.g., 26 -> 2)
  
        if (range.hours.includes(startHour)) { // Check if start hour falls within the current time range
          durations[index] += duration;
        }
      });
    }
  
    // Calculate the percentage for each range
    const percentages = durations.map(duration => (duration / totalTime) * 100);
    return percentages;
  };
  
  
  
  

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        try {
          const presentTime = await fetchPresentTime(userId);
          const engagementPercentages = calculateEngagement(presentTime);
          setEngagementData(engagementPercentages);
        } catch (error) {
          console.error("Error fetching data: ", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [userId]);

 

  
  const data = {
    labels: timeRanges.map((range) => range.label),
    datasets: [
      {
        label: "Engagement Percentage",
        data: engagementData,
        borderColor: "rgba(7, 69, 163, 1)",
        backgroundColor: "rgba(0,0,0,0)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    scales: {
      x: { title: { display: true, text: "Time Ranges" } },
      y: {
        title: { display: true, text: "Engagement Percentage" },
        min: 0,
        max: 100,
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return loading ? (
    <p>Loading...</p>
  ) : (
    <div>
      <p className="text-black" style={{fontFamily: '"Inter", sans-serif', fontWeight: '600', fontSize:'20px'}}>Engagement Over Time</p>
      <div style={{ width: '70%', height: '380px' }}>
     <Line
      ref={chartRef}
      data={data}
      options={{
        ...options,
        responsive: true,
        maintainAspectRatio: false, // Ensures that width and height are respected
        elements: {
          line: {
            borderWidth:4 , // Adjust the line width here
          },
          point: {
            radius: 5, // Adjust the point size here
            hoverRadius: 8, // Adjust the hover point size here
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Time Ranges" },
            ticks: {
              font: {
                size: 14, // Adjust font size for X-axis labels
              },
            },
          },
          y: {
            title: { display: true, text: "Engagement Percentage" },
            min: 0,
            max: 100,
            ticks: {
              font: {
                size: 14, // Adjust font size for Y-axis labels
              },
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              font: {
                size: 14, // Adjust font size for legend labels
              },
            },
          },
          tooltip: {
            bodyFont: {
              size: 14, // Adjust font size for tooltip text
            },
          },
        },
      }}
    />
    </div>
    </div>
  );
};

export default EngagementChart;
