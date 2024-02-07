import { useEffect, useRef, useState } from "react";

interface IuseStopwatchProp {
  options?: {
    // planned
    // decorateTime?: boolean;
    // customDecorateMethod?: (utc: number) => string;
    customStartTime?: number;
  };
  onStart?: (currentTime: number) => void;
  onStop?: (currentTime: number) => void;
  onReset?: (currentTime: number) => void;
}

interface IuseStopwatchReturn {
  currentTime: number;
  startTime: number;
  isTimerActive: boolean | null;
  timerRef: React.MutableRefObject<number | null>;
  timerState: "paused" | "stopped" | "resumed";
  reset: () => void;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

function useStopwatch(prop?: IuseStopwatchProp): IuseStopwatchReturn {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [isTimerActive, setIsTimerActive] = useState<boolean | null>(null);
  const initialDate = useRef<number>(prop?.options?.customStartTime || Date.now());
  const pausedTime = useRef<number>(0);
  const totalPausedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const start = () => {
    const presentTime = Date.now();
    prop?.onStart && prop?.onStart(presentTime);
    setCurrentTime(presentTime);
    setIsTimerActive(true);
    initialDate.current = presentTime;
    timerRef.current = null;
  };

  const reset = () => {
    const currentTimeUTC = Date.now();
    prop?.onReset && prop?.onReset(currentTimeUTC);
    setCurrentTime(currentTimeUTC);
    initialDate.current = currentTimeUTC;
    timerRef.current = null;
  };

  const stop = () => {
    prop?.onStop && prop?.onStop(Date.now());
    setIsTimerActive(null);
  };

  const pause = () => {
    setIsTimerActive(false);
    pausedTime.current = Date.now();
  }

  const resume = () => {
    if(isTimerActive === null){
      console.error("Timer not intialized, please use start method first");
      return;
    }
    totalPausedTime.current = totalPausedTime.current + pausedTime.current - Date.now()
    setIsTimerActive(true);
  }

  useEffect(() => {
    if (!timerRef.current && isTimerActive) {
      timerRef.current = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1);
    }
    if (timerRef.current && !isTimerActive) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [isTimerActive]);

  return {
    currentTime: currentTime - initialDate.current + totalPausedTime.current,
    startTime: initialDate.current,
    timerRef,
    isTimerActive,
    timerState: isTimerActive === null ? "stopped" : isTimerActive ? "resumed" : "paused",
    reset,
    start,
    stop,
    pause,
    resume
  };
}

export default useStopwatch;