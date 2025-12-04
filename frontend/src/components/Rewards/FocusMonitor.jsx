import { useEffect } from "react";

const FocusMonitor = ({ currentMode }) => {
  useEffect(() => {
    // Request notification permission once on mount (or on some user action)
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const handleVisibilityChange = () => {
      if (currentMode === "pomodoro" && document.hidden) {
        const message = "Hey! Stay focused on your Study session!";

        // Show native browser notification if permission granted
        if (Notification.permission === "granted") {
          new Notification("Focus Reminder", {
            body: message,
            icon: "/path/to/your-icon.png", // optional: add a small icon
          });
        }

        // Voice Alert (Text-to-Speech)
        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = "en-US"; // Set language
        speech.rate = 1; // Adjust speed (1 = normal)
        speech.pitch = 1; // Adjust pitch (1 = normal)
        speech.volume = 1; // Volume (0 to 1)
        window.speechSynthesis.speak(speech);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentMode]);

  return null; // No UI needed
};

export default FocusMonitor;
