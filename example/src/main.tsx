import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useStopwatch, decorateTimeStamp } from 'react-dead-simple-stopwatch-hook'

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

  // Highlight fastest/slowest once there are at least two laps to compare.
  const lapTimes = laps.map((l) => l.lapTime)
  const fastest = laps.length > 1 ? Math.min(...lapTimes) : null
  const slowest = laps.length > 1 ? Math.max(...lapTimes) : null

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, fontVariantNumeric: 'tabular-nums' }}>
      <h1>{decorateTimeStamp(currentTime)}</h1>
      <p>
        State: <strong>{timerState}</strong> · Current lap: {decorateTimeStamp(currentLapTime)}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => start()}>Start</button>
        <button onClick={() => lap()} disabled={timerState !== 'resumed'}>Lap</button>
        <button onClick={pause}>Pause</button>
        <button onClick={resume}>Resume</button>
        <button onClick={reset}>Reset</button>
        <button onClick={stop}>Stop</button>
      </div>

      {laps.length > 0 && (
        <table style={{ marginTop: 16, borderCollapse: 'collapse' }}>
          <thead>
            <tr><th align="left">Lap</th><th align="right">Lap time</th><th align="right">Split</th></tr>
          </thead>
          <tbody>
            {[...laps].reverse().map((l) => (
              <tr
                key={l.lap}
                style={{ color: l.lapTime === fastest ? 'green' : l.lapTime === slowest ? 'crimson' : undefined }}
              >
                <td style={{ paddingRight: 24 }}>{l.lap}</td>
                <td align="right" style={{ paddingRight: 24 }}>{decorateTimeStamp(l.lapTime)}</td>
                <td align="right">{decorateTimeStamp(l.splitTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ul>{log.map((line, i) => <li key={i}>{line}</li>)}</ul>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
