import { useEffect, useState, useRef } from "react";

const ScreenRecorder = ({ currentMode }) => {
    const [recording, setRecording] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);

    useEffect(() => {
        if (currentMode === "pomodoro" && !recording) {
            startRecording();
        } else if (currentMode !== "pomodoro" && recording) {
            stopRecording();
        }
    }, [currentMode]); // Reacts to mode changes

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
                setVideoUrl(URL.createObjectURL(blob));
                recordedChunksRef.current = []; // Reset chunks
            };

            mediaRecorderRef.current.start();
            setRecording(true);
        } catch (error) {
            console.error("Screen recording permission denied:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    return (
        <div>
            {recording && (
                <button onClick={stopRecording} style={{ padding: "10px", background: "red", color: "white" }}>
                    Stop Recording
                </button>
            )}
            {videoUrl && (
                <div>
                    <h4>Download Your Session:</h4>
                    <a href={videoUrl} download="pomodoro-recording.webm">
                        Download Video
                    </a>
                </div>
            )}
        </div>
    );
};

export default ScreenRecorder;
