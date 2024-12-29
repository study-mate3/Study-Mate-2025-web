import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";

import SidePanel from "../components/SidePanel";


const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState('work');
  const [settings, setSettings] = useState({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setShowAlert(true);
      handleModeComplete();
      // Hide alert after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleModeComplete = () => {
    setCurrentMode('work');
    setTimeLeft(settings.workTime * 60);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(settings.workTime * 60);
    setCurrentMode('work');
  };

  const updateSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: parseInt(value) || 0
    }));
    if (currentMode === key.replace('Time', '')) {
      setTimeLeft(value * 60);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const switchMode = (mode) => {
    setCurrentMode(mode);
    let newTime;
    switch (mode) {
      case 'work':
        newTime = settings.workTime * 60;
        break;
      case 'shortBreak':
        newTime = settings.shortBreak * 60;
        break;
      case 'longBreak':
        newTime = settings.longBreak * 60;
        break;
      default:
        newTime = settings.workTime * 60;
    }
    setTimeLeft(newTime);
    setIsRunning(false);
  };

  const getTimerColor = () => {
    switch (currentMode) {
      case 'work':
        return 'text-red-600';
      case 'shortBreak':
        return 'text-green-600';
      case 'longBreak':
        return 'text-blue-600';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="flex items-center min-h-screen">
      <SidePanel />
      <div className="flex-grow bg-gray-100 flex items-center justify-center">
      
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Pomodoro Timer
              </h1>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {showSettings && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Timer Settings</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label>Work Time (min):</label>
                    <input
                      type="number"
                      value={settings.workTime}
                      onChange={(e) => updateSettings('workTime', e.target.value)}
                      className="w-20 p-2 border rounded"
                      min="1"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <label>Short Break (min):</label>
                    <input
                      type="number"
                      value={settings.shortBreak}
                      onChange={(e) => updateSettings('shortBreak', e.target.value)}
                      className="w-20 p-2 border rounded"
                      min="1"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <label>Long Break (min):</label>
                    <input
                      type="number"
                      value={settings.longBreak}
                      onChange={(e) => updateSettings('longBreak', e.target.value)}
                      className="w-20 p-2 border rounded"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center space-y-6">
              <div className={`text-6xl font-mono font-bold ${getTimerColor()}`}>
                {formatTime(timeLeft)}
              </div>
              
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => switchMode('work')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentMode === 'work'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Work
                </button>
                <button
                  onClick={() => switchMode('shortBreak')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentMode === 'shortBreak'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Short Break
                </button>
                <button
                  onClick={() => switchMode('longBreak')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentMode === 'longBreak'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Long Break
                </button>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={toggleTimer}
                  className={`p-4 rounded-lg transition-colors ${
                    currentMode === 'work'
                      ? 'bg-red-500 hover:bg-red-600'
                      : currentMode === 'shortBreak'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-4 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {showAlert && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg">
            Time is up! {currentMode === 'work' ? "Take a break!" : "Back to work!"}
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;