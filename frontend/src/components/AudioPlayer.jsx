import React, { useRef, useState } from 'react';

const AudioPlayer = () => {
    const [audioFile, setAudioFile] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);
    const audioRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "audio/mpeg") {
            setAudioFile(URL.createObjectURL(file));
        }
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleRemove = () => {
        audioRef.current.pause();
        setIsPlaying(false);
        setAudioFile(null);
        setShowPlayer(false); // Hide player again
    };

    return (
        <div className="fixed right-0 top-0 p-4">
            {!showPlayer && (
                <button onClick={() => setShowPlayer(true)} className="bg-blue-800 text-white px-4 py-2 rounded-xl">
                    🎧 Focus with Music
                </button>
            )}

            {showPlayer && (
                <div className="p-4 border rounded-lg bg-blue-400 shadow-md">
                    {!audioFile && (
                        <input type="file" accept=".mp3" onChange={handleFileChange} />
                    )}

                    {audioFile && (
                        <div className="space-y-2">
                            <audio ref={audioRef} src={audioFile} onEnded={() => setIsPlaying(false)} />
                            <div className="flex gap-2">
                                <button onClick={handlePlayPause} className="bg-blue-800 text-white px-3 py-1 rounded">
                                    {isPlaying ? 'Pause' : 'Play'}
                                </button>
                                <button onClick={handleRemove} className="bg-red-700 text-white px-3 py-1 rounded">
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AudioPlayer;
