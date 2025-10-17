import { useEffect } from "react";

const FocusMonitor = ({ currentMode }) => {
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (currentMode === "pomodoro" && document.hidden) {
                const message = "Hey! Stay focused on your Study session!";

                // Display alert
              /*   alert(message); */

                // Voice Alert (Text-to-Speech)
                const speech = new SpeechSynthesisUtterance(message);
                speech.lang = "en-US"; // Set language
                speech.rate = 1; // Adjust speed (1 = normal)
                speech.pitch = 1; // Adjust pitch (1 = normal)
                speech.volume = 1; // Volume (0 to 1)

                // Speak message
                window.speechSynthesis.speak(speech);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [currentMode]); // Re-run when session type changes

    return null; // This component only tracks focus, no UI
};

export default FocusMonitor;
