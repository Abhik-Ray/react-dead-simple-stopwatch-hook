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
  isTimerActive: boolean;
  timerRef: React.MutableRefObject<number | null>;
  reset: () => void;
  start: () => void;
  stop: () => void;
}

function useStopwatch(prop: IuseStopwatchProp): IuseStopwatchReturn {
  const { options, onStart, onStop, onReset } = prop;
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const initialDate = useRef<number>(options?.customStartTime || Date.now());
  const timerRef = useRef<number | null>(null);

  const start = () => {
    const presentTime = Date.now();
    onStart && onStart(presentTime);
    setCurrentTime(presentTime);
    setIsTimerActive(true);
    initialDate.current = presentTime;
    timerRef.current = null;
  };

  const reset = () => {
    const currentTimeUTC = Date.now();
    onReset && onReset(currentTimeUTC);
    setCurrentTime(currentTimeUTC);
    initialDate.current = currentTimeUTC;
    timerRef.current = null;
  };

  const stop = () => {
    onStop && onStop(Date.now());
    setIsTimerActive(false);
  };

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
    currentTime: currentTime - initialDate.current,
    startTime: initialDate.current,
    timerRef,
    isTimerActive,
    reset,
    start,
    stop,
  };
}

export default useStopwatch;