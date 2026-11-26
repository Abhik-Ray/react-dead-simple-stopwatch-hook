import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useStopwatch, decorateTimeStamp } from 'react-dead-simple-stopwatch-hook'
import './style.css'

const REPO = 'https://github.com/Abhik-Ray/react-dead-simple-stopwatch-hook'
const NPM = 'https://www.npmjs.com/package/react-dead-simple-stopwatch-hook'

function App() {
  const [log, setLog] = useState<string[]>([])
  const note = (event: string) => (t: number) =>
    setLog((l) => [`${event} @ ${new Date(t).toLocaleTimeString()}`, ...l].slice(0, 5))

  const {
    currentTime, currentLapTime, laps, timerState,
    start, stop, pause, resume, reset, lap,
  } = useStopwatch({
    onStart: note('start'),
    onStop: note('stop'),
    onPause: note('pause'),
    onResume: note('resume'),
    onReset: note('reset'),
    onLap: (l) => note(`lap ${l.lap}`)(l.timestamp),
  })

  const running = timerState === 'resumed'
  const paused = timerState === 'paused'

  // Highlight fastest/slowest once there are at least two laps to compare.
  const lapTimes = laps.map((l) => l.lapTime)
  const fastest = laps.length > 1 ? Math.min(...lapTimes) : null
  const slowest = laps.length > 1 ? Math.max(...lapTimes) : null

  return (
    <main>
      <header>
        <h1>⏱️ react-dead-simple-stopwatch-hook</h1>
        <p>Tiny, accurate React stopwatch hook with laps, pause/resume and TypeScript types.</p>
        <code className="install">npm i react-dead-simple-stopwatch-hook</code>
        <nav>
          <a href={REPO}>GitHub</a>
          <a href={NPM}>npm</a>
          <a href={`${REPO}#readme`}>Docs</a>
        </nav>
      </header>

      <section className="watch" aria-label="Stopwatch demo">
        <div className="time" aria-live="off">{decorateTimeStamp(currentTime)}</div>
        <div className="meta">
          <span className={`state state-${timerState}`}>{timerState === 'resumed' ? 'running' : timerState}</span>
          <span>Current lap {decorateTimeStamp(currentLapTime)}</span>
        </div>

        <div className="controls">
          {running ? (
            <button onClick={pause}>Pause</button>
          ) : paused ? (
            <button onClick={resume}>Resume</button>
          ) : (
            <button className="primary" onClick={() => start()}>Start</button>
          )}
          <button onClick={() => lap()} disabled={!running}>Lap</button>
          <button onClick={reset}>Reset</button>
          <button onClick={stop} disabled={timerState === 'stopped'}>Stop</button>
        </div>

        {laps.length > 0 && (
          <table>
            <thead>
              <tr><th>Lap</th><th>Lap time</th><th>Split</th></tr>
            </thead>
            <tbody>
              {[...laps].reverse().map((l) => (
                <tr
                  key={l.lap}
                  className={l.lapTime === fastest ? 'fastest' : l.lapTime === slowest ? 'slowest' : undefined}
                >
                  <td>{l.lap}</td>
                  <td>{decorateTimeStamp(l.lapTime)}</td>
                  <td>{decorateTimeStamp(l.splitTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {log.length > 0 && (
        <section className="log" aria-label="Callback log">
          <h2>Callbacks</h2>
          <ul>{log.map((line, i) => <li key={i}>{line}</li>)}</ul>
        </section>
      )}

      <section className="code" aria-label="Usage">
        <h2>Usage</h2>
        <pre>{`const { currentTime, laps, start, pause, resume, lap } = useStopwatch();

<span>{decorateTimeStamp(currentTime)}</span>
<button onClick={() => start()}>Start</button>
<button onClick={() => lap()}>Lap</button>`}</pre>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
