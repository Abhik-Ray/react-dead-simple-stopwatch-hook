import { useCallback, useEffect, useReducer, useRef, useState } from "react";

export type TimerState = "stopped" | "paused" | "resumed";

export interface Lap {
  /** 1-based lap number. */
  lap: number;
  /** Time of this lap alone (ms since the previous lap, or since start for lap 1). */
  lapTime: number;
  /** Total elapsed time (ms) when the lap was recorded. */
  splitTime: number;
  /** Epoch timestamp (Date.now()) when the lap was recorded. */
  timestamp: number;
}

export interface UseStopwatchOptions {
  /**
   * Epoch timestamp (ms) to count from on the first `start()`.
   * Useful when the stopwatch should have started in the past.
   */
  customStartTime?: number;
  /** How often (ms) the displayed time refreshes while running. Default: 10. */
  interval?: number;
}

export interface UseStopwatchProps {
  options?: UseStopwatchOptions;
  /** Each callback receives the epoch timestamp (Date.now()) of the event. */
  onStart?: (timestamp: number) => void;
  onStop?: (timestamp: number) => void;
  onPause?: (timestamp: number) => void;
  onResume?: (timestamp: number) => void;
  onReset?: (timestamp: number) => void;
  /** Called with the new lap whenever `lap()` records one. */
  onLap?: (lap: Lap) => void;
}

export interface UseStopwatchReturn {
  /** Elapsed time in milliseconds, excluding paused time. */
  currentTime: number;
  /** Epoch timestamp the stopwatch counts from. */
  startTime: number;
  /** `true` running, `false` paused, `null` stopped. */
  isTimerActive: boolean | null;
  /** Holds the active interval id while running. */
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  timerState: TimerState;
  /** Starts (or restarts) from zero, or from `customStartTime` if given. */
  start: (customStartTime?: number) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  /** Sets elapsed time back to zero without changing the running state. Clears laps. */
  reset: () => void;
  /** Records a lap and returns it. Only works while running; otherwise returns `undefined`. */
  lap: () => Lap | undefined;
  /** Recorded laps, oldest first. Cleared by `start()` and `reset()`, kept by `stop()`. */
  laps: Lap[];
  /** Time (ms) since the last lap, or since start if there are no laps. */
  currentLapTime: number;
}

/** @deprecated Use `UseStopwatchProps`. */
export type IuseStopwatchProp = UseStopwatchProps;
/** @deprecated Use `UseStopwatchReturn`. */
export type IuseStopwatchReturn = UseStopwatchReturn;

const DEFAULT_INTERVAL = 10;

export function useStopwatch(props: UseStopwatchProps = {}): UseStopwatchReturn {
  // Latest props, so the returned functions can stay referentially stable.
  const propsRef = useRef(props);
  propsRef.current = props;

  const [isTimerActive, setIsTimerActive] = useState<boolean | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  // start()/reset() may not change any state value (e.g. restarting while running),
  // so they force a re-render after updating the refs.
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  const activeRef = useRef<boolean | null>(null);
  const startTimeRef = useRef<number>(now);
  // Only meaningful while paused; always set by pause() (and reset() while paused).
  const pausedAtRef = useRef<number>(0);
  const stoppedAtRef = useRef<number | null>(null);
  const totalPausedRef = useRef<number>(0);
  const hasStartedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [laps, setLaps] = useState<Lap[]>([]);
  const lapsRef = useRef<Lap[]>([]);

  const setActive = (value: boolean | null) => {
    activeRef.current = value;
    setIsTimerActive(value);
  };

  const clearLaps = () => {
    lapsRef.current = [];
    setLaps(lapsRef.current);
  };

  const start = useCallback((customStartTime?: number) => {
    const timestamp = Date.now();
    const optionStart = hasStartedRef.current
      ? undefined
      : propsRef.current.options?.customStartTime;
    hasStartedRef.current = true;

    startTimeRef.current = customStartTime ?? optionStart ?? timestamp;
    totalPausedRef.current = 0;
    stoppedAtRef.current = null;
    clearLaps();
    setNow(timestamp);
    setActive(true);
    forceRender();
    propsRef.current.onStart?.(timestamp);
  }, []);

  const stop = useCallback(() => {
    if (activeRef.current === null) return;
    const timestamp = Date.now();
    // If paused, freeze at the moment of pausing so the pause isn't counted.
    stoppedAtRef.current =
      activeRef.current === false ? pausedAtRef.current : timestamp;
    setNow(timestamp);
    setActive(null);
    propsRef.current.onStop?.(timestamp);
  }, []);

  const pause = useCallback(() => {
    if (activeRef.current !== true) return;
    const timestamp = Date.now();
    pausedAtRef.current = timestamp;
    setNow(timestamp);
    setActive(false);
    propsRef.current.onPause?.(timestamp);
  }, []);

  const resume = useCallback(() => {
    if (activeRef.current === null) {
      console.error("Timer not initialized, please use start method first");
      return;
    }
    if (activeRef.current === true) return;
    const timestamp = Date.now();
    totalPausedRef.current += timestamp - pausedAtRef.current;
    setNow(timestamp);
    setActive(true);
    propsRef.current.onResume?.(timestamp);
  }, []);

  const reset = useCallback(() => {
    const timestamp = Date.now();
    startTimeRef.current = timestamp;
    totalPausedRef.current = 0;
    if (activeRef.current === false) pausedAtRef.current = timestamp;
    if (activeRef.current === null) stoppedAtRef.current = timestamp;
    clearLaps();
    setNow(timestamp);
    forceRender();
    propsRef.current.onReset?.(timestamp);
  }, []);

  const lap = useCallback((): Lap | undefined => {
    if (activeRef.current !== true) return undefined;
    const timestamp = Date.now();
    const splitTime = Math.max(
      0,
      timestamp - startTimeRef.current - totalPausedRef.current,
    );
    const previous = lapsRef.current[lapsRef.current.length - 1];
    const newLap: Lap = {
      lap: lapsRef.current.length + 1,
      lapTime: splitTime - (previous?.splitTime ?? 0),
      splitTime,
      timestamp,
    };
    lapsRef.current = [...lapsRef.current, newLap];
    setLaps(lapsRef.current);
    // Sync the display so currentTime equals this lap's splitTime right away.
    setNow(timestamp);
    propsRef.current.onLap?.(newLap);
    return newLap;
  }, []);

  const interval = props.options?.interval ?? DEFAULT_INTERVAL;

  // Tick only while running; the cleanup also runs on unmount.
  useEffect(() => {
    if (isTimerActive !== true) return;
    const id = setInterval(() => setNow(Date.now()), interval);
    timerRef.current = id;
    return () => {
      clearInterval(id);
      timerRef.current = null;
    };
  }, [isTimerActive, interval]);

  const end =
    isTimerActive === true
      ? now
      : isTimerActive === false
        ? pausedAtRef.current
        : (stoppedAtRef.current ?? startTimeRef.current);

  const currentTime = Math.max(0, end - startTimeRef.current - totalPausedRef.current);
  const lastSplit = laps.length > 0 ? laps[laps.length - 1].splitTime : 0;

  return {
    currentTime,
    startTime: startTimeRef.current,
    isTimerActive,
    timerRef,
    timerState:
      isTimerActive === null ? "stopped" : isTimerActive ? "resumed" : "paused",
    start,
    stop,
    pause,
    resume,
    reset,
    lap,
    laps,
    currentLapTime: Math.max(0, currentTime - lastSplit),
  };
}
