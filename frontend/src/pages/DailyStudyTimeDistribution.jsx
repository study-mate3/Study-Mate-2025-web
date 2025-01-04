import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const DailyStudyTimeDistribution = () => {
  const data = {
    labels: ['Morning', 'Afternoon', 'Evening', 'Night'], // Time slots of the day
    datasets: [
      {
        label: 'Study Hours Distribution (%)',
        data: [25, 35, 20, 20], // Example data representing percentage of study hours
        backgroundColor: ['#4caf50', '#2196f3', '#ffeb3b', '#ff5722'],
        borderRadius: 10,
      },
    ],
  };

  const options = {
    indexAxis: 'y', // Horizontal bar chart
    animation: {
      duration: 2000, // Animation duration in milliseconds
      easing: 'easeInOutBounce', // Easing function for the animation
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100, // X-axis percentage from 0 to 100
        title: {
          display: true,
          text: 'Percentage of Study Hours',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Time of Day',
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hide the legend if not needed
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.raw}%`, // Show percentage in tooltip
        },
      },
    },
  };

  return (
    <div>
      <h2>Daily Study Time Distribution</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default DailyStudyTimeDistribution;
