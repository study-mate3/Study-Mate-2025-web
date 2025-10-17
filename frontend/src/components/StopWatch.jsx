import React, { useEffect, useState } from 'react';
import './StopWatch.css'; // Import the CSS file
import CustomTimerBox from './CustomTimerBox/CustomTimerBox';
import SliderCustomizationBox from './SliderCustomizationBox/SliderCustomizationBox';
import ToDoListBox from './ToDoListBox/ToDoListBox'; // Import the ToDoListBox component
import FinishMessage from './FinishMessage/FinishMessage';
import MotivationalQ from './MotivationalQuotes/MotivationalQ';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc,updateDoc, arrayUnion, increment, setDoc } from 'firebase/firestore';
import { format } from "date-fns-tz";
import SidePanel from './SidePanel';
import { Link, useNavigate } from 'react-router-dom';
import FocusMonitor from './Rewards/FocusMonitor';
import ScreenRecorder from './ScreenRecoder/ScreenRecorder';
import AudioPlayer from './AudioPlayer';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";




export default function StopWatch() {
    // State variables
    const [time, setTime] = useState(20 *60* 1000); // Default
    const [initialTime, setInitialTime] = useState(10 * 1000); // Default to 20 minutes for Pomodoro
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

 const tourSteps = [
  {
    element: "#pomodoro-tab",
    popover: {
      title: "Pomodoro Timer",
      description:
        "Here you can start your Pomodoro timer — a focused study method where you work for a set time (like 25 minutes) and take breaks in between. It's great for improving concentration and avoiding burnout.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#breaks-tab",
    popover: {
      title: "Short Break",
      description:
        "Set your short breaks here, usually around 5 minutes. Short breaks help you refresh your mind before starting the next study session.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#longbreak-tab",
    popover: {
      title: "Long Break",
      description:
        "Use this to set your long break, for example 15–30 minutes. Taking longer breaks after several Pomodoro sessions helps your brain recover and stay productive.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '#start-btn',
    popover: {
      title: 'Start Button',
      description: 'Click to start your timer.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '#stop-btn',
    popover: {
      title: 'Stop Button',
      description: 'Pause your current timer at any time.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '#reset-btn',
    popover: {
      title: 'Reset Timer',
      description: 'Reset your timer to its original value.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '#extend-btn',
    popover: {
      title: 'Add 10 Minutes',
      description: 'Click here to extend your focus session by 10 minutes.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: "#user",
    popover: {
      title: "Your Dashboard",
      description:
        "Here’s your personal dashboard — you can view your study progress, earned rewards, and detailed analytics about your performance.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#home",
    popover: {
      title: "Home",
      description:
        "This takes you back to the main page of the web app.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#timer",
    popover: {
      title: "Timer",
      description:
        "Here you can set your main timer, customize Pomodoro sessions, and even upload background music to help you stay focused while studying.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#todo",
    popover: {
      title: "To-Do List",
      description:
        "Go to the To-Do page to manage your daily tasks efficiently and stay on track with your study goals.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#quiz",
    popover: {
      title: "Practice Quizzes",
      description:
        "Take short quizzes here to test your knowledge and improve your learning through practice.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#notifications",
    popover: {
      title: "Notifications",
      description:
        "You’ll receive important updates and announcements from our team here. Keep an eye on this section for new features or reminders.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#logout",
    popover: {
      title: "Logout",
      description:
        "If you want to log out from your account, click here safely.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#faq",
    popover: {
      title: "FAQ & Support",
      description:
        "Find answers to the most frequently asked questions. You can also submit any issue or feedback to our support team from here.",
      side: "right",
      align: "center",
    },
  },
  
  {
    element: "#customizeTimer",
    popover: {
      title: "Customize Timer",
      description:
        "Adjust your Pomodoro, short break, and long break durations here — personalize them the way you study best.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#music",
    popover: {
      title: "Music",
      description:
        "You can upload your preferred music file here and listen while studying. It helps you stay calm, focused, and relaxed during long sessions.",
      side: "right",
      align: "center",
    },
  },
  
  {
    popover: {
      title: "You're All Set!",
      description:
        "That’s the quick tour of your study partner - StudyMate. Now you can explore and start your focused learning journey! 🎯",
    },
  },
];



    
    
   /*  useEffect(() => {
    const driverObj = driver({
    animate: false,
    showProgress: true,
    showButtons: ['previous', 'next', 'close'],
    steps: [
      {
        element: '#side-panel',
        popover: {
          title: 'Navigation Bar',
          description: 'Here you can explore different sections like Focus Monitor, To-do List, and Rewards.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#pomodoro-tab',
        popover: {
          title: 'Pomodoro Mode',
          description: 'Start your focused work session here.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#breaks-tab',
        popover: {
          title: 'Breaks',
          description: 'Take short 5-minute breaks between sessions.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#longbreak-tab',
        popover: {
          title: 'Long Breaks',
          description: 'Enjoy a longer rest after several Pomodoro rounds.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#start-btn',
        popover: {
          title: 'Start Button',
          description: 'Click to start your Pomodoro timer.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#stop-btn',
        popover: {
          title: 'Stop Button',
          description: 'Pause your current timer at any time.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#reset-btn',
        popover: {
          title: 'Reset Timer',
          description: 'Reset your timer to its original value.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#extend-btn',
        popover: {
          title: 'Add 10 Minutes',
          description: 'Click here to extend your focus session by 10 minutes.',
          side: 'top',
          align: 'center'
        }
      },
      {
        popover: {
          title: 'All Set!',
          description: 'You’re ready to master your focus time — enjoy using the timer! 🎯'
        }
      }
    ]
  });

  driverObj.drive();
    }, []); */


     

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
            console.log(`Current hour: ${currentHour}`); 
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

    const updateWorkingTime = async () => {
        const user = auth.currentUser;
        if (!user) {
          console.error("User not authenticated");
          return;
        }
      
        const currentHour = new Date().getHours(); // Get current hour
        let collectionName = "";
      
        if ([22, 23, 0, 1, 2, 3].includes(currentHour)) {
          collectionName = "nightowl";
        } else if ([4, 5, 6, 7, 8].includes(currentHour)) {
          collectionName = "earlybird";
        } else {
          console.log("Current hour does not match any category.");
          return;
        }
      
        const userRef = doc(db, "users", user.uid,  "rewards", collectionName);
      
        try {
          const docSnap = await getDoc(userRef);
      
          if (docSnap.exists()) {
            const currentValue = docSnap.data().count || 0; // Get existing count
            await updateDoc(userRef, { count: currentValue + 1 });
          } else {
            await setDoc(userRef, { count: 1 }); // If no record, create one
          }
      
          console.log(`Updated ${collectionName} count successfully!`);
        } catch (error) {
          console.error(`Error updating ${collectionName} count:`, error);
        }
      };

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

    // Send a message to the Chrome extension to activate tracking
    if (window.chrome && chrome.runtime) {
        chrome.runtime.sendMessage({ action: "start_tracking" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError.message);
            } else {
                console.log("Tracking started:", response);
            }
        });
    } else {
        console.error("Chrome extension not detected.");
    }
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

    const handleExtendTime = () => {
        setTime(prevTime => prevTime + 10 * 60 * 1000); // Add 10 minutes in milliseconds
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

    const saveInitialTime = async (newTime) => {
        const user = auth.currentUser;
        if (!user) {
          console.error("User not authenticated");
          return;
        }
      
        const userRef = doc(db, "users", user.uid, "rewards", "pomodoro");
        try {
            const docSnap = await getDoc(userRef);
        
            if (docSnap.exists()) {
              const currentTime = docSnap.data().initialTime || 0; // Get existing time
              const updatedTime = currentTime + newTime; // Add new time
        
              await updateDoc(userRef, { initialTime: updatedTime });
            } else {
              await setDoc(userRef, { initialTime: newTime }); // If no record, create one
            }
        
            console.log("Initial time updated successfully!");
          } catch (error) {
            console.error("Error updating initial time:", error);
          }
        };
    const updatePomodoroCount = async () => {
        console.log("Function updatePomodoroCount is running...");

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
                setTime(prev => prev - 1000);
            }, 1000);
        }
    
        return () => clearInterval(intervalId);
    }, [isRunning, time]);
    
    useEffect(() => {
        if (time <= 0) {
            setIsRunning(false);
            setIsAlarmActive(true);
            setTimeout(() => setIsAlarmActive(false), 5000);
    
            if (currentMode === 'pomodoro') {
                setFinishMessage('High five! 👋 Work’s done!\n Chill out for a bit, then let’s get back to it!');
                setFinishImage('GoodJob.gif');
                updatePomodoroCount();
                saveInitialTime(initialTime);
                updateWorkingTime();
                
            } else {
                setFinishMessage('Break time’s up!\n Time to jump back into work. Set your timer and rock on!');
                setFinishImage('clockRun.gif');
            }
            setShowFinishMessage(true);
        }
    }, [time]);// Dependencies

   /*  useEffect(() => {
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
    }, [showAlert, responseMessage]);*/


    
    const handleCloseAlert = () => {
        setResponseMessage('');
        setShowAlert(false); // Hide the alert
        setShowAcknowledgement(false); // Hide the acknowledgment message
        setTimeout(() => {
            setShowAcknowledgement(false);
            setResponseMessage(false);
            setShowAlert(false);
        }, 5000);
    };
    
    const handleCloseFinishMessage = async () => {
        setShowFinishMessage(false);
        setTime(initialTime);
      
        try {
            const user = auth.currentUser; // Get the currently logged-in user
        
            if (!user) {
              console.error("No user is logged in.");
              return; // Stop execution if no user is logged in
            }
        
            const userRef = doc(db, "users", user.uid); // Reference to the user's document in Firestore
        
            // Get the current timestamp in Colombo time
            const presentTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX", {
              timeZone: "Asia/Colombo",
            });
        
            // Update the "presentTime" array with the new timestamp
            await updateDoc(userRef, {
              presentTime: arrayUnion(presentTime),
            });
        
            console.log("Time saved successfully:", presentTime);
          } catch (error) {
            console.error("Error saving time to Firestore:", error);
          }
        
          // Navigate to /PomodoroReview if the current mode is 'pomodoro'
          if (currentMode === "pomodoro") {
            navigate("/PomodoroReview");
          }
    };

    /* const engagedTime = async () => {
        try {
          const user = auth.currentUser; // Get the currently logged-in user
      
          if (!user) {
            console.error("No user is logged in.");
            return; // Stop execution if no user is logged in
          }
      
          const userRef = doc(db, "users", user.uid); // Reference to the user's document in Firestore
      
          // Get the current timestamp in Colombo time
          const presentTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX", {
            timeZone: "Asia/Colombo",
          });
      
          // Update the "presentTime" array with the new timestamp
          await updateDoc(userRef, {
            presentTime: arrayUnion(presentTime),
          });
      
          console.log("Time saved successfully:", presentTime);
        } catch (error) {
          console.error("Error saving time to Firestore:", error);
        }
      };
     */



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
            
     <div id="side-panel" style={sidePanelStyle}>
          {/*   <ScreenRecorder currentMode={currentMode} /> */}
        <SidePanel setName={setName}/>
      </div>

      <div id="music" className="fixed right-0 top-0">
    <AudioPlayer />
    <button
        className="help-btn"
        onClick={() => {
            const guide = driver({
            showButtons: ['previous', 'next', 'close'],
            steps: tourSteps
            });
            guide.drive();
        }}
        >
        Show Guide
        </button>


</div>

      
            <div className="header-container">
            
               {/*  <FocusMonitor currentMode={currentMode}/> */}
            <div className=" flex justify-center items-center mb-14">
                        <div className="w-[120px]"><img src="whitelogo.png" alt="" /></div>
                      </div>
                <div className="greeting-box">
                    <div className="greeting-text">{greeting}, {name}!</div>
                </div>
                <div className="quote-container">
{/*                  <span className="quote-start">“</span>
 */}                   

                <span className="quote-text"><MotivationalQ/></span>
                  
                </div>

                

                <div className="stopwatch-container">
                    
                    <div className='timer-grid'>
                    <div className='topics'>
                        <div id="pomodoro-tab" className={`pomodoro ${currentMode === 'pomodoro' ? 'active' : ''}`} 
                             style={{ background: currentMode === 'pomodoro' ? '#D9D9D9' : '#012862', color: currentMode === 'pomodoro' ? '#012862' : '#D9D9D9' }} 
                             onClick={handlePomodoroClick}>Pomodoros
                        </div>
                        <div id="breaks-tab" className={`breaks ${currentMode === 'break' ? 'active' : ''}`} 
                             style={{ background: currentMode === 'break' ? '#D9D9D9' : '#012862', color: currentMode === 'break' ? '#012862' : '#D9D9D9' }} 
                             onClick={handleBreaksClick}>Breaks
                        </div>
                        <div id="longbreak-tab" className={`lbreaks ${currentMode === 'longBreak' ? 'active' : ''}`} 
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
                            <button id="customizeTimer" className="customize-timer" onClick={handleCustomizeClick}>Customize Timer</button>
                            <div className="button-container">
                                <button id="start-btn" className="start" onClick={handleStart}>
                                    <img src="https://i.imgur.com/u82cGA3.png" alt="Start" />
                                </button>
                                <button id="stop-btn" className="stop" onClick={handleStop}>
                                    <img src="https://i.imgur.com/7sBZBI0.png" alt="Stop" />
                                </button>
                                <button id="reset-btn" className="reset" onClick={handleReset}>
                                    <img src="https://i.imgur.com/Y4iDX1g.png" alt="Reset" />
                                </button>
                                <button id="extend-btn" className="extend" onClick={handleExtendTime}>
                                    <img src="https://i.imgur.com/KYdc80b.png" alt="Add 10 minutes" />
                                </button>
                            </div>
                            <button id="to-do" className="manage-to-do-list" onClick={handleManageToDoListClick}>Manage To-do List</button>
                        </div>
                   
                        
                    </div>
                    
                    {isAlarmActive && (
                        <audio autoPlay>
                            <source src="/digital-alarm-2-151919.mp3" type="audio/mp3" />
                            Your browser does not support the audio element.
                        </audio>
                    )}

                  {isCustomizing && (
                        <div className="modal-viewport">
                            <CustomTimerBox
                            onClose={handleCloseCustomTimerBox}
                            onSelect={handleSelectTimer}
                            />
                            <SliderCustomizationBox
                            onClose={handleCloseSliderCustomizationBox}
                            onSelect={handleSelectTimer}
                            />
                        </div>
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
  
        </div>
    </>
)}


{/* 
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
        )}   */}

                </div>
                <div className="text-container">
               
                            <img src="https://i.imgur.com/1udOWc6.png" alt="Icon" className="icon" />
                            <span className="reminder-text">Need timer reminders and study tips?&nbsp;&nbsp;</span>
                            <span className="highlight-text">
                             <Link to='/login'>Join Us for Free!</Link>
                             </span>
                        </div>
            </div>
            </div>
        
    );
}
