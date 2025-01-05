
import React, {useEffect} from "react";
import StopWatch from "../components/StopWatch";


const PomodoroTimer = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (

    <div><StopWatch /></div>
  );
};

export default PomodoroTimer;

