# ⏱️ React Dead Simple Stopwatch Hook

[![CI](https://github.com/Abhik-Ray/react-dead-simple-stopwatch-hook/actions/workflows/ci.yml/badge.svg)](https://github.com/Abhik-Ray/react-dead-simple-stopwatch-hook/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/react-dead-simple-stopwatch-hook)](https://www.npmjs.com/package/react-dead-simple-stopwatch-hook)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-dead-simple-stopwatch-hook)](https://bundlephobia.com/package/react-dead-simple-stopwatch-hook)
[![types](https://img.shields.io/npm/types/react-dead-simple-stopwatch-hook)](https://www.npmjs.com/package/react-dead-simple-stopwatch-hook)

## Features ✨
- Start, stop, pause, resume and reset
- Laps with lap and split times
- Accurate: based on `Date.now()`, so it doesn't drift like counting `setInterval` ticks
- ~1 kB gzipped, zero dependencies
- TypeScript types included
- Works with React 18 and 19
- Cleans up after itself on unmount

## Install ⬇
```sh
npm i react-dead-simple-stopwatch-hook
```

## Quickstart ⚡
```tsx
import { useStopwatch, decorateTimeStamp } from 'react-dead-simple-stopwatch-hook';

function App() {
  const { currentTime, timerState, start, stop, pause, resume, reset } = useStopwatch();

  return (
    <>
      <button onClick={() => start()}>start</button>
      <button onClick={stop}>stop</button>
      <button onClick={pause}>pause</button>
      <button onClick={resume}>resume</button>
      <button onClick={reset}>reset</button>

      <span>{decorateTimeStamp(currentTime)}</span>
      <small>{timerState}</small>
    </>
  );
}
```

## `useStopwatch(props?)`

### Props
| value | type | default | description |
| ---- | ---- | ---- | ---- |
| `options.customStartTime` | `number` | `undefined` | Epoch timestamp (ms) to count from on the **first** `start()`, e.g. to resume a stopwatch that began earlier |
| `options.interval` | `number` | `10` | How often (ms) the displayed time refreshes while running. Doesn't affect accuracy, only update frequency |
| `onStart`, `onStop`, `onPause`, `onResume`, `onReset` | `(timestamp: number) => void` | `undefined` | Called on each event with the `Date.now()` timestamp of that event |
| `onLap` | `(lap: Lap) => void` | `undefined` | Called with the new lap each time `lap()` records one |

### Returns
| value | type | description |
| ---- | ---- | ---- |
| `currentTime` | `number` | Elapsed milliseconds, excluding time spent paused |
| `startTime` | `number` | Epoch timestamp the stopwatch counts from |
| `isTimerActive` | `boolean \| null` | `true` running, `false` paused, `null` stopped |
| `timerState` | `"stopped" \| "paused" \| "resumed"` | Same state as a string (`"resumed"` means running) |
| `timerRef` | `MutableRefObject` | Holds the interval id while running |
| `start(customStartTime?)` | `(customStartTime?: number) => void` | Starts (or restarts) from zero, or from the given epoch timestamp |
| `stop()` | `() => void` | Stops and freezes `currentTime`. The next `start()` begins from zero |
| `pause()` | `() => void` | Pauses. Does nothing unless running |
| `resume()` | `() => void` | Resumes after a pause. Logs an error if the stopwatch was never started |
| `reset()` | `() => void` | Sets elapsed time back to zero, keeping the current running/paused state. Clears laps |
| `lap()` | `() => Lap | undefined` | Records a lap and returns it. Only works while running; otherwise returns `undefined` |
| `laps` | `Lap[]` | Recorded laps, oldest first. Cleared by `start()` and `reset()`, kept by `stop()` |
| `currentLapTime` | `number` | Milliseconds since the last lap (or since start, if there are none) |

All returned functions are stable across renders, so they're safe in `useEffect` dependency arrays.

## Laps

```tsx
const { currentTime, currentLapTime, laps, start, lap } = useStopwatch();

<button onClick={() => lap()}>Lap</button>
<p>Current lap: {decorateTimeStamp(currentLapTime)}</p>
<ol>
  {laps.map((l) => (
    <li key={l.lap}>
      {decorateTimeStamp(l.lapTime)} (total {decorateTimeStamp(l.splitTime)})
    </li>
  ))}
</ol>
```

Each `Lap` is:

| field | type | description |
| ---- | ---- | ---- |
| `lap` | `number` | 1-based lap number |
| `lapTime` | `number` | Milliseconds for this lap alone |
| `splitTime` | `number` | Total elapsed milliseconds when the lap was recorded |
| `timestamp` | `number` | `Date.now()` when the lap was recorded |

Paused time is excluded from both `lapTime` and `splitTime`. The lap times always add up to the last split time.

## `decorateTimeStamp(ms)`

Formats milliseconds as `mm:ss:SSS`, e.g. `61234` → `"01:01:234"`. Minutes keep counting past 59.

| param | type | description |
| ---- | ---- | ---- |
| `ms` | `number` | Duration in milliseconds |

Returns the formatted `string`.

## Development
```sh
npm install
npm test               # run the test suite once
npm run test:watch     # re-run tests on change
npm run test:coverage  # tests + coverage report (fails below 100%)
npm run typecheck      # tsc, including type-level tests
npm run lint
npm run build          # outputs build/ with ESM, UMD and type declarations
npm run test:package   # build, then check the package as consumers see it
```

`test:package` loads the build via both `import` and `require`, runs [publint](https://publint.dev), and runs [Are The Types Wrong?](https://arethetypeswrong.github.io) against the files npm would publish. `prepublishOnly` runs all of the checks above, so a broken build can't be published.

CI runs the same checks on Node 20 and 22 against both React 18 and React 19.

### Try it locally

`example/` is a minimal Vite + React 19 app that uses the local build:

```sh
npm run build
cd example
npm install
npm run dev   # http://localhost:5174
```

Re-run `npm run build` in the root after changing the hook; the example picks up the new build on reload.

### Releasing

Pushing a version tag runs [the release workflow](.github/workflows/release.yml). It checks that the tag matches `package.json`, runs every check, **stages** the package on npm with provenance, and creates the GitHub release using that version's section of [CHANGELOG.md](CHANGELOG.md).

1. Move the `## [Unreleased]` notes in CHANGELOG.md under a new `## [x.y.z] - YYYY-MM-DD` heading. The release fails if this is missing.
2. Bump the version and create the tag: `npm version patch` (or `minor` / `major`, or `prerelease --preid beta`).
3. Push the commit and the tag: `git push --follow-tags`.
4. Approve the staged version with 2FA: on npmjs.com, avatar → **Staged Packages** → **Approve** (or `npm stage approve <stage-id>`). Nothing is live on npm until you do.

Prerelease versions like `2.1.0-beta.1` are published under npm's `next` tag and marked as prereleases on GitHub. If the GitHub release step fails after staging, approve the npm version first, then re-run the workflow; it skips anything already done.

One-time setup: on npmjs.com, open the package's **Settings → Trusted Publisher**, choose **GitHub Actions**, and enter owner `Abhik-Ray`, repository `react-dead-simple-stopwatch-hook` and workflow `release.yml`. Leave **Allow npm publish** unchecked so the workflow can only stage releases, never publish them directly. No npm token is needed.

## License

[MIT](LICENSE)
