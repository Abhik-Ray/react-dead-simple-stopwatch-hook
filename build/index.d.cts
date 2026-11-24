/// <reference types="react" />

export declare const decorateTimeStamp: (ms: number) => string;

/** @deprecated Use `UseStopwatchProps`. */
export declare type IuseStopwatchProp = UseStopwatchProps;

/** @deprecated Use `UseStopwatchReturn`. */
export declare type IuseStopwatchReturn = UseStopwatchReturn;

export declare interface Lap {
    /** 1-based lap number. */
    lap: number;
    /** Time of this lap alone (ms since the previous lap, or since start for lap 1). */
    lapTime: number;
    /** Total elapsed time (ms) when the lap was recorded. */
    splitTime: number;
    /** Epoch timestamp (Date.now()) when the lap was recorded. */
    timestamp: number;
}

export declare type TimerState = "stopped" | "paused" | "resumed";

export declare function useStopwatch(props?: UseStopwatchProps): UseStopwatchReturn;

export declare interface UseStopwatchOptions {
    /**
     * Epoch timestamp (ms) to count from on the first `start()`.
     * Useful when the stopwatch should have started in the past.
     */
    customStartTime?: number;
    /** How often (ms) the displayed time refreshes while running. Default: 10. */
    interval?: number;
}

export declare interface UseStopwatchProps {
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

export declare interface UseStopwatchReturn {
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

export { }
