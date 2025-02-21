import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Register necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ComparisonGraphs = () => {
  const [genderData, setGenderData] = useState({ male: 0, female: 0, other: 0 });
  const [gradeData, setGradeData] = useState({ "6-9": 0, "10-11": 0, "12-13": 0, university: 0 });

  useEffect(() => {
    // Fetch the gender and grade statistics from Firestore or wherever you're storing them.
    const fetchStats = async () => {
      try {
        const statsRef = doc(db, "stats", "userCounts");
        const statsSnap = await getDoc(statsRef);

        if (statsSnap.exists()) {
          const data = statsSnap.data();
          setGenderData({
            male: data.gender.male || 0,
            female: data.gender.female || 0,
            other: data.gender.other || 0,
          });

          setGradeData({
            "6-9": data.grades["6-9"] || 0,
            "10-11": data.grades["10-11"] || 0,
            "12-13": data.grades["12-13"] || 0,
            university: data.grades.university || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  // Gender chart options
  const genderChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    animation: {
      duration: 1500,
      easing: "easeInOutQuad",
    },
  };

  // Grade chart options
  const gradeChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    animation: {
      duration: 1500,
      easing: "easeInOutQuad",
    },
  };

  // Data for gender chart
  const genderChartData = {
    labels: ["Male", "Female", "Other"],
    datasets: [
      {
        label: "Gender Comparison",
        data: [genderData.male, genderData.female, genderData.other],
        backgroundColor: ["#6CB4EE", "#0066b2", "#00CED1"], // Custom colors
        borderColor: "#00CED1",
        borderWidth: 1,
      },
    ],
  };

  // Data for grade chart
  const gradeChartData = {
    labels: ["6-9", "10-11", "12-13", "University"],
    datasets: [
      {
        label: "Grade Comparison",
        data: [
          gradeData["6-9"],
          gradeData["10-11"],
          gradeData["12-13"],
          gradeData.university,
        ],
        backgroundColor: ["#007791", "#0047AB", "#0071c5", "#48D1CC"], // Custom colors
        borderColor: "#00CED1",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="comparison-graphs">
      <h2 className="text-center text-2xl font-bold mb-6">User Analytics Overview</h2>

      <div className="flex justify-around gap-8">
        <div className="gender-graph w-1/2">
          <h3 className="text-center font-semibold">Gender Comparison</h3>
          <Bar data={genderChartData} options={genderChartOptions} />
        </div>

        <div className="grade-graph w-1/2">
          <h3 className="text-center font-semibold">Grade Comparison</h3>
          <Bar data={gradeChartData} options={gradeChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default ComparisonGraphs;
