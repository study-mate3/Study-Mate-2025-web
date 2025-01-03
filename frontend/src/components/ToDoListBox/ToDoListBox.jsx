import React, { useState } from 'react';
import './ToDoListBox.css'; // Import the CSS file for styling

const ToDoListBox = ({ onClose }) => {
    const [task, setTask] = useState('');
    const [tasks, setTasks] = useState([]);

    const handleAddTask = () => {
        if (task.trim()) {
            setTasks([...tasks, { text: task, completed: false }]);
            setTask('');
        }
    };

    const handleCancel = () => {
        setTask('');
    };

    const handleCheckboxChange = (index) => {
        const newTasks = tasks.map((t, i) =>
            i === index ? { ...t, completed: !t.completed } : t
        );
        setTasks(newTasks);
    };

    return (
        <div className="todo-list-box">
            <div className="header">
                <img src="https://i.imgur.com/ZcZBaZ9.png" alt="Icon" className="header-icon" /> {/* Replace with your icon URL */}
                <h2 className="heading">To-do List</h2>
                <button className="close-btn" onClick={onClose}>X</button>
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Enter your task here..."
                />
               
            </div>
            <div className='bttns'> 
                <button className="add-btn" onClick={handleAddTask}>Add</button>
                <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                </div>
            <div className="tasks-container">
                {tasks.map((t, index) => (
                    <div key={index} className="task-item">
                        <input
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => handleCheckboxChange(index)}
                        />
                        <span className={t.completed ? 'completed' : ''}>{t.text}</span>
                    </div>
                ))}
            </div>

            <div className="text-container2">
                            <img src="https://i.imgur.com/Qag63xZ.png" alt="Icon" className="icon" />
                            <span className="reminder-text">Looking for more features in your to-do list?&nbsp;&nbsp; </span>
                            <span className="highlight-text"> Join us for free!</span>
                        </div>
        </div>
    );
};

export default ToDoListBox;
