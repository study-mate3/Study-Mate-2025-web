import React from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const StudyHoursOverviewChart = () => {
    const data = {
        datasets: [
            {
                label: 'Study Hours',
                data: [
                    { x: '2nd Oct (Monday)', y: 8 },
                    { x: '3rd Oct (Tuesday)', y: 6 },
                    { x: '4th Oct (Wednesday)', y: 10 },
                    { x: '5th Oct (Thursday)', y: 7 },
                    { x: '6th Oct (Friday)', y: 9 },
                    { x: '7th Oct (Saturday)', y: 5 },
                    { x: '8th Oct (Sunday)', y: 4 },
                    { x: '9th Oct (Monday)', y: 8 },
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
            },
        ],
    };

    const options = {
        scales: {
            x: {
                type: 'category',
                title: { display: true, text: 'Day' },
                labels: [
                    '2nd Oct (Monday)',
                    '3rd Oct (Tuesday)',
                    '4th Oct (Wednesday)',
                    '5th Oct (Thursday)',
                    '6th Oct (Friday)',
                    '7th Oct (Saturday)',
                    '8th Oct (Sunday)',
                    '9th Oct (Monday)',
                ],
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Total Study Hours' },
                ticks: { stepSize: 1 },
            },
        },
    };

    return (
        <div style={{ width: '600px', margin: '0 auto' }}>
            <h3>Study Hours Overview (2nd Oct - 9th Oct)</h3>
            <Scatter data={data} options={options} />
        </div>
    );
};

export default StudyHoursOverviewChart;
