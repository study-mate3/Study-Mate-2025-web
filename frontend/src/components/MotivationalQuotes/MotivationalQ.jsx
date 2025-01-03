import { useEffect, useState } from 'react';

// Step 1: Define an array of custom Mquotes outside the component
const MquotesArray = [
  { Mquote: "Lost time is never found again.", Mauthor: "Benjamin Franklin" },
  { Mquote: "Time management is life management.", Mauthor: "Robin Sharma" },
  { Mquote: "The bad news is time flies. The good news is you’re the pilot.", Mauthor: "Michael Altshuler" },
  { Mquote: "An inch of time is an inch of gold, but you can’t buy that inch of time with an inch of gold.", Mauthor: "Chinese Proverb" },
  { Mquote: "Time is what we want most, but what we use worst.", Mauthor: "William Penn" },
  { Mquote: "There is no substitute for hard work.", Mauthor: "Thomas Edison" },
  { Mquote: "The future depends on what you do today.", Mauthor: "Mahatma Gandhi" },
  { Mquote: "It’s not about having time. It’s about making time.", Mauthor: "Unknown" },
  { Mquote: "The way to get started is to quit talking and begin doing.", Mauthor: "Walt Disney" },
  { Mquote: "Success is the sum of small efforts, repeated day in and day out.", Mauthor: "Robert Collier" },
  { Mquote: "You may delay, but time will not.", Mauthor: "Benjamin Franklin" },
];

function MotivationalQ() {
  const [Mquote, setMquote] = useState('');
  const [Mauthor, setMauthor] = useState('');

  // Step 2: Function to get a random Mquote from the array
  function getRandomMquote() {
    const randomIndex = Math.floor(Math.random() * MquotesArray.length);
    setMquote(MquotesArray[randomIndex].Mquote);
    setMauthor(MquotesArray[randomIndex].Mauthor);
  }

  useEffect(() => {
    getRandomMquote(); // Display a Mquote immediately when the component loads

    // Set up the interval to change the Mquote every 30 seconds
    const intervalId = setInterval(() => {
      getRandomMquote();
    }, 30000); // 30 seconds = 30000 milliseconds

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className="motivational-quotes"
      style={{
        fontFamily: 'Caveat, cursive',
        fontSize: '22px',
        marginTop: '20px',
        marginBottom: '20px',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0, fontStyle: 'italic' }}>"{Mquote}"</p>
      <p style={{ margin: 0, fontWeight: 'bold' }}>--- {Mauthor}</p>
    </div>
  );
}

export default MotivationalQ;
