import React, { useRef, useState } from "react";

const AudioPlayer = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const audioRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Allow common audio types on mobile browsers
    if (file.type.startsWith("audio/")) {
      setAudioFile(URL.createObjectURL(file));
      setShowPlayer(true);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying((v) => !v);
  };

  const handleRemove = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setAudioFile(null);
    setShowPlayer(false);
  };

  return (
    <>
      {/* Toggle button: bottom-right on mobile, top-right on md+ */}
      {!showPlayer && (
        <div className="fixed z-50 bottom-8 right-4 md:top-4 md:right-4 md:bottom-auto">
          <button
            onClick={() => setShowPlayer(true)}
            className="rounded-full bg-blue-800 text-white px-4 py-3 text-sm md:text-base shadow-lg active:scale-[0.98]"
            aria-label="Open audio player"
          >
            🎧 Focus with Music
          </button>
        </div>
      )}

      {showPlayer && (
        <div
          className={`
            fixed z-50
            inset-x-0 bottom-0
            md:inset-auto md:top-4 md:right-4
            w-full md:w-80
            rounded-t-2xl md:rounded-xl
            bg-blue-500/95 backdrop-blur
            text-white shadow-2xl
          `}
          role="region"
          aria-label="Audio player"
        >
          {/* Header row */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-semibold">Focus Player</span>
            <button
              onClick={() => setShowPlayer(false)}
              className="rounded-md bg-white/15 hover:bg-white/25 px-2 py-1 text-sm"
              aria-label="Close player"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-4 pb-4 pt-1">
            {!audioFile ? (
              <label className="block">
                <span className="block text-xs md:text-sm mb-2 opacity-90">
                  Upload an audio file
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-blue-700 file:font-medium file:cursor-pointer hover:file:bg-blue-50 cursor-pointer"
                />
              </label>
            ) : (
              <>
                <audio
                  ref={audioRef}
                  src={audioFile}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* Controls: stack on mobile, inline on md+ */}
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePlayPause}
                      className="rounded-lg bg-blue-800 px-4 py-2 text-sm md:text-xs"
                    >
                      {isPlaying ? "Pause" : "Play"}
                    </button>
                    <button
                      onClick={handleRemove}
                      className="rounded-lg bg-red-700 px-4 py-2 text-sm md:text-xs"
                    >
                      Remove
                    </button>
                  </div>

                  {/* (Optional) simple progress bar for mobile-friendly scrubbing */}
                  <input
                    type="range"
                    min={0}
                    max={audioRef.current?.duration || 0}
                    step="0.01"
                    defaultValue={0}
                    onChange={(e) => {
                      if (!audioRef.current) return;
                      audioRef.current.currentTime = Number(e.target.value);
                    }}
                    onInput={(e) => {
                      // keep the thumb responsive in real-time
                      if (!audioRef.current) return;
                      e.target.value = audioRef.current.currentTime;
                    }}
                    className="w-full md:flex-1 accent-white"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AudioPlayer;
