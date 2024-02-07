# ⏱️ React Dead Simple Stopwatch Hook

## Features ✨
- Simple stopwatch hook
- Basic features like pause, unpause, start, stop
- Small size and no dependencies
- Uses Date.now for accurate readings

## Install ⬇
````npmi
npm i react-dead-simple-stopwatch-hook
````

## Quickstart ⚡
````tsx
import { useStopwatch, decorateTimeStamp } from 'react-dead-simple-stopwatch-hook';

function App() {
const {
  currentTime,
  isTimerActive,
  start,
  stop,
  pause,
  resume
} = useStopwatch();

  return (
    <>
        <button onClick={() => start()}>start</button>
        <button onClick={() => stop()}>stop</button>
        <button onClick={() => pause()}>pause</button>
        <button onClick={() => resume()}>resume</button>

        <span>{decorateTimeStamp(currentTime)}</span>
    </>
  )
}
````

## useStopwatch API

### params
| value | type | default value | description |
| ---- | ---- | ---- | ---- |
| options.customStartTime | number | Date.now() | Adds a custom start time if you want to start the timer late |
| onStart, onStop, onPause | () => void \| undefined  | undefined | Calls custom function before start, stop, pause |

### return
| value | type | description |
| ---- | ---- | ---- |
| currentTime | number | The current type returned as a difference of epoch timestamp, i.e. the result of Date.now() |
| startTime | number | The epoch timestamp from which we started the watch |
| isTimerActive | boolean \| null | Timer running state |
| timerRef | MutableRefObject<number \| null> | Ref for the setInterval |
| timerState | "paused" \| "stopped" \| "resumed" | Simplified state for the timer |
| start() | () => void | Starts the timer from startTime |
| stop() | () => void | Stops the timer completely. Starting the timer from here starts from 00:00:00 |
| pause() | () => void | Pauses the timer |
| resume() | () => void | Resumes the timer. Works only when timer is paused and not stopped. |

## decorateTimeStamp

### params
| value | type | default value | description |
| ---- | ---- | ---- | ---- |
| ms | number | 0 | Epoch of the time to change |

### return
| value | type | description |
| ---- | ---- | ---- |
| formattedTime | string | timestamp in the format mm:ss:ms |