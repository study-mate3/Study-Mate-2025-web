import React, { useEffect, useState } from 'react';
import './StopWatch.css'; // Import the CSS file
import CustomTimerBox from './CustomTimerBox/CustomTimerBox';
import SliderCustomizationBox from './SliderCustomizationBox/SliderCustomizationBox';
import ToDoListBox from './ToDoListBox/ToDoListBox'; // Import the ToDoListBox component
import FinishMessage from './FinishMessage/FinishMessage';
import MotivationalQ from './MotivationalQuotes/MotivationalQ';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc,updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { format } from "date-fns-tz";
import SidePanel from './SidePanel';
import { Link, useNavigate } from 'react-router-dom';



export default function StopWatch() {
    // State variables
    const [time, setTime] = useState(20 * 60 * 1000); // Default
    const [initialTime, setInitialTime] = useState(1 * 60 * 1000); // Default to 20 minutes for Pomodoro
    const [isRunning, setIsRunning] = useState(false);
    const [isAlarmActive, setIsAlarmActive] = useState(false);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [breakTime, setBreakTime] = useState(5 * 60 * 1000); // Default to 5 minutes
    const [longBreakTime, setLongBreakTime] = useState(15 * 60 * 1000); // Default to 15 minutes
    const [currentMode, setCurrentMode] = useState('pomodoro'); // Track current mode
    const [greeting, setGreeting] = useState('');
    const [showFinishMessage, setShowFinishMessage] = useState(false);
    const [finishMessage, setFinishMessage] = useState('');
    const [finishImage, setFinishImage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [autoHideTimeout, setAutoHideTimeout] = useState(null);
    const [showAcknowledgement, setShowAcknowledgement] = useState(false);
    const [name, setName] = useState('Learner');
    const auth = getAuth();
    const db = getFirestore();
     

     useEffect(() => {
        const storedName = localStorage.getItem('username');
        console.log('Stored name:', storedName); // Debugging to check what's in localStorage
        if (storedName) {
          setName(storedName);
        } else {
          setName('Learner');
        }
      }, []);

    useEffect(() => {
        const updateGreeting = () => {
            const currentHour = new Date().getHours();
            console.log(`Current hour: ${currentHour}`); // Log the current hour for debugging
            if (currentHour < 12) {
                setGreeting('Good Morning');
            } else if (currentHour < 18) {
                setGreeting('Good Afternoon');
            } else {
                setGreeting('Good Evening');
            }
        };

        updateGreeting();
        // Optionally update the greeting every hour
        const intervalId = setInterval(updateGreeting, 3600000); // Update every hour

        return () => {
            clearInterval(intervalId);
        };
    }, []);



    const formatTime = (milliseconds) => {
        const totalMinutes = Math.floor(milliseconds / (1000 * 60)); // Total minutes
        const minutes = totalMinutes % 60; // Minutes in the current hour
        const hours = Math.floor(totalMinutes / 60); // Total hours
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000); // Seconds in the current minute

        // Format the time string based on whether hours are present or not
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
        }
    };

    const handleStart = () => {
        setIsRunning(true);
    };

    const handleStop = () => {
        setIsRunning(false);
    };

    const handleReset = () => {
        switch (currentMode) {
            case 'pomodoro':
                setTime(initialTime); // Reset to Pomodoro time
                break;
            case 'break':
                setTime(breakTime); // Reset to Break time
                break;
            case 'longBreak':
                setTime(longBreakTime); // Reset to Long Break time
                break;
            default:
                setTime(initialTime); // Default to Pomodoro time if mode is unknown
        }
        setIsRunning(false);
    };

    const handlePomodoroClick = () => {
        setCurrentMode('pomodoro'); // Set mode to Pomodoro
        setTime(initialTime); // Set time to the current Pomodoro time
        if (isRunning) {
            handleReset(); // Reset if running
        }
    };

    const handleBreaksClick = () => {
        setCurrentMode('break'); // Set mode to Break
        setTime(breakTime); // Set time to the current Break time
        if (isRunning) {
            handleReset(); // Reset if running
        }
    };

    const handleLongBreaksClick = () => {
        setCurrentMode('longBreak'); // Set mode to Long Break
        setTime(longBreakTime); // Set time to the current Long Break time
        if (isRunning) {
            handleReset(); // Reset if running
        }
    };

    const handleCustomizeClick = () => {
        setIsCustomizing(true);
    };

    const handleCloseCustomTimerBox = () => {
        setIsCustomizing(false);
    };

    const handleSelectTimer = (pomodoroTime, breakTime, longBreakTime) => {
        setInitialTime(pomodoroTime);
        setTime(pomodoroTime); // Set the timer based on selection
        setBreakTime(breakTime);
        setLongBreakTime(longBreakTime);
        setCurrentMode('pomodoro'); // Default to Pomodoro mode
        setIsRunning(false); // Stop the timer if it's running
    };

    const handleCloseSliderCustomizationBox = () => {
        setIsCustomizing(false);
    };

    const [isManagingToDoList, setIsManagingToDoList] = useState(false);
    const navigate = useNavigate();

    const handleManageToDoListClick = () => {
       navigate('/todo-after-login')
    };
    
    const handleCloseToDoListBox = () => {
        setIsManagingToDoList(false);
    };
    const updatePomodoroCount = async () => {
        const user = auth.currentUser;
        console.log("Current user:", user);
        if (user) {
            try {
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, {
                    completedPomodoros: increment(1),
                });
    
                console.log("Pomodoro completed count updated!");
            } catch (error) {
                console.error("Error updating completedPomodoros:", error);
            }
        } else {
            console.log("No user is authenticated.");
        }
    };
    useEffect(() => {
        let intervalId;
        
       
        if (isRunning && time > 0) {
            intervalId = setInterval(() => {
                setTime(prev => prev - 1000); // Decrement by 1000 milliseconds (1 second)
            }, 1000); // Interval of 1000 milliseconds (1 second)
    
            // Show alert when halfway through Pomodoro time
            if (currentMode === 'pomodoro' && time === initialTime / 2 && !showAlert) {
                setShowAlert(true);
                setShowAcknowledgement(false); // Ensure acknowledgment is hidden
            }
        } else if (time <= 0) {
            setIsRunning(false);
            setIsAlarmActive(true);
            setTimeout(() => setIsAlarmActive(false), 5000); // Alarm rings for 5 seconds
    
            // Set finish message and image based on current mode
            if (currentMode === 'pomodoro') {
                setFinishMessage('High five! 👋 Work’s done!\n Chill out for a bit, then let’s get back to it!');
                setFinishImage('GoodJob.gif');
                updatePomodoroCount();
            } else {
                setFinishMessage('Break time’s up!\n Time to jump back into work. Set your timer and rock on!');
                setFinishImage('clockRun.gif');
            }
            setShowFinishMessage(true); // Show the finish message
        }
    
        return () => clearInterval(intervalId);
    }, [isRunning, time]); // Dependencies

    useEffect(() => {
        if (showAlert) {
            // Show alert after halfway through Pomodoro time
            const timeout = setTimeout(async () => {
                if (!responseMessage) {
                    setResponseMessage('Ah, you seem to not be studying. We will note this!');
                    setShowAcknowledgement(true); // Show the acknowledgment message
                    setShowAlert(true); // Hide the alert
                    const user = auth.currentUser; 
                    const userRef = doc(db, "users", user.uid); 

                    const absentTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX", {
                        timeZone: "Asia/Colombo",
                      });
              
                    await updateDoc(userRef, {
                    absentTime: arrayUnion(absentTime), // Save the timestamp in the "absentTime" array
                });

                console.log("Absent time saved:", absentTime);
                }
            }, 10000); // 10 seconds
    
            return () => clearTimeout(timeout);
        }
    }, [showAlert, responseMessage]);


    const handleYesClick = async () => {
        try {
          const user = auth.currentUser; // Get the currently logged-in user
      
          if (user) {
            const userRef = doc(db, "users", user.uid); // Reference to the user's document in Firestore
           
            // Get the current timestamp
            const presentTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX", {
                timeZone: "Asia/Colombo",
              });
      
            // Update the "presentTime" array with the new timestamp
            await updateDoc(userRef, {
                presentTime: arrayUnion(presentTime),
              });
      
            console.log("Time saved successfully:", presentTime);
      
            // Update UI states
            setResponseMessage("Ah, okay! Good job, keep up the great work!");
            setShowAcknowledgement(true); // Show the acknowledgment message
            setShowAlert(true); // Hide the alert
          } else {
            console.error("No user is logged in.");

          }
        } catch (error) {
          console.error("Error saving time to Firestore:", error);
        }
      };
    
    const handleCloseAlert = () => {
        setResponseMessage('');
        setShowAlert(false); // Hide the alert
        setShowAcknowledgement(false); // Hide the acknowledgment message
        if (autoHideTimeout) {
            clearTimeout(autoHideTimeout); // Clear timeout if needed
        }
    };
    
    const handleCloseFinishMessage = () => {
        setShowFinishMessage(false);
        setTime(initialTime);
    };

    useEffect(() => {
        const fetchUserName = async () => {
          const user = auth.currentUser;
          if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setName(userDoc.data().name); // Update name with the fetched value
            }
          }
        };
    
        fetchUserName();
      }, [auth, db]);

      const sidePanelStyle = {
        position: 'fixed', // Fixes the panel position
        left: 0, // Positions it at the leftmost edge
       
            }

    return (
        
        <div className='timerbody'>
            <div style={sidePanelStyle}>
        <SidePanel setName={setName}/>
      </div>
            <div className="header-container">
                
                <div className="greeting-box">
                    <div className="greeting-text">{greeting}, {name}!</div>
                </div>
                <div className="quote-container">
{/*                  <span className="quote-start">“</span>
 */}                   
                <span className="quote-text"><MotivationalQ/></span>
{/*                  <span className="quote-end">”</span>
 */}                  {/*   <span className="quote-author"> <br/></span>
                    <span className="quote-author">– Mahatma Gandhi</span>  */}
                </div>

                <div className="stopwatch-container">
                    <div className='middle-container'>
                    <div className='topics'>
                        <div className={`pomodoro ${currentMode === 'pomodoro' ? 'active' : ''}`} 
                             style={{ background: currentMode === 'pomodoro' ? '#D9D9D9' : '#012862', color: currentMode === 'pomodoro' ? '#012862' : '#D9D9D9' }} 
                             onClick={handlePomodoroClick}>Pomodoros
                        </div>
                        <div className={`breaks ${currentMode === 'break' ? 'active' : ''}`} 
                             style={{ background: currentMode === 'break' ? '#D9D9D9' : '#012862', color: currentMode === 'break' ? '#012862' : '#D9D9D9' }} 
                             onClick={handleBreaksClick}>Breaks
                        </div>
                        <div className={`lbreaks ${currentMode === 'longBreak' ? 'active' : ''}`} 
                             style={{ background: currentMode === 'longBreak' ? '#D9D9D9' : '#012862', color: currentMode === 'longBreak' ? '#012862' : '#D9D9D9' }} 
                             onClick={handleLongBreaksClick}>Long Breaks
                        </div>
                    </div>
                    <div className="StopWatch">
                        <h5>{formatTime(time)}</h5>
                        

                        
                    </div>
                    </div>
                    <div className="controls-container">
                    <div className="btns">
                            <button className="customize-timer" onClick={handleCustomizeClick}>Customize Timer</button>
                            <div className="button-container">
                                <button className="start" onClick={handleStart}>
                                    <img src="https://i.imgur.com/u82cGA3.png" alt="Start" />
                                </button>
                                <button className="stop" onClick={handleStop}>
                                    <img src="https://i.imgur.com/7sBZBI0.png" alt="Stop" />
                                </button>
                                <button className="reset" onClick={handleReset}>
                                    <img src="https://i.imgur.com/Y4iDX1g.png" alt="Reset" />
                                </button>
                            </div>
                            <button className="manage-to-do-list" onClick={handleManageToDoListClick}>Manage To-do List</button>
                        </div>

                        
                    </div>
                    
                    {isAlarmActive && (
                        <audio autoPlay>
                            <source src="/digital-alarm-2-151919.mp3" type="audio/mp3" />
                            Your browser does not support the audio element.
                        </audio>
                    )}

                    {isCustomizing && (
                        <>
                            <CustomTimerBox onClose={handleCloseCustomTimerBox} onSelect={handleSelectTimer} />
                            <SliderCustomizationBox onClose={handleCloseSliderCustomizationBox} onSelect={handleSelectTimer} />
                        </>
                    )}

                    {isManagingToDoList && (
                        <ToDoListBox onClose={handleCloseToDoListBox} />
                    )}

                    {showFinishMessage && (
                        <FinishMessage
                            message={finishMessage}
                            imageSrc={finishImage}
                            onClose={handleCloseFinishMessage}
                        />
                    )}

{showAlert && (
    <>
        <div className={`overlay ${showAlert ? 'active' : ''}`}></div>
        <div className={`alert-box ${showAlert ? 'active' : ''}`}>
            <audio autoPlay>
                <source src="bell-notification.wav" type="audio/wav" />
                Your browser does not support the audio element.
            </audio>
            {!responseMessage ? (
                <div className='alert-box'>
                    <img src="are_you_awake.png" alt="Question Image" className="inline-image" />
                    <p>Hi, are you studying or busy with something else?</p>
                    <button onClick={handleYesClick}>Yes, I'm focused on my studies!</button>
                </div>
            ) : (
                <>
                    <p>{responseMessage}</p>
                    <button onClick={handleCloseAlert}>Close</button>
                </>
            )}
        </div>
    </>
)}



        {showAcknowledgement && responseMessage === 'Ah, you seem to not be studying. We will note this!' && (
            <div className="alert-box">
                <img src="not_studing.png" alt="notStudy Image" className="inline-image" />
                <p>Ah, you seem to not be studying. We will note this!</p>
                <button onClick={handleCloseAlert}>Close</button>
            </div>
        )}

        {showAcknowledgement && responseMessage === 'Ah, okay! Good job, keep up the great work!' && (
            <div className="alert-box">
                <img src="good_job.png" alt="notStudy Image" className="inline-image" />
                <p>Ah, okay! Good job, keep up the great work!</p>
                <button onClick={handleCloseAlert}>Close</button>
            </div>
        )}  

                </div>
                <div className="text-container">
                            <img src="https://i.imgur.com/1udOWc6.png" alt="Icon" className="icon" />
                            <span className="reminder-text">Need timer reminders and study tips?&nbsp;&nbsp;</span>
                            <span className="highlight-text"> Join us for free!</span>
                        </div>
            </div>
            </div>
        
    );
}
