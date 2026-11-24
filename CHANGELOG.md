# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-11-24

### Breaking changes
- **License is now MIT.** Previously the `LICENSE` file said GPL-3.0 while `package.json` said ISC.
- **Peer dependencies:** `react` `^18.0.0 || ^19.0.0`. `react-dom` is no longer a peer dependency.
- **`customStartTime` now works.** It used to be ignored; it now sets the starting point of the first `start()`.
- **Pauses are handled correctly.** Calling `stop()` while paused no longer counts the paused time, and `start()`/`reset()` clear earlier pause time. Code that worked around the old numbers may see different values.
- **Updates every 10ms instead of 1ms** by default, so far fewer re-renders. Set `options.interval` to change it. Accuracy is unaffected.
- **`timerRef` type** is now `MutableRefObject<ReturnType<typeof setInterval> | null>`.
- **UMD global** renamed to `ReactDeadSimpleStopwatchHook`; the old name wasn't a valid identifier.

### Added
- **Laps:** `lap()`, `laps` (each with `lapTime`, `splitTime` and `timestamp`), `currentLapTime` and an `onLap` callback. Exported `Lap` type.
- TypeScript declarations for both `import` and `require`.
- `onPause` and `onResume` callbacks.
- `options.interval` to control how often the time refreshes.
- `start(customStartTime?)` to start from a given epoch timestamp.
- Exported types: `UseStopwatchProps`, `UseStopwatchReturn`, `UseStopwatchOptions`, `TimerState`.
- The returned functions are stable across renders, so they're safe in effect dependency arrays.

### Fixed
- Elapsed time was wrong after pause → resume → stop → start.
- The interval kept running after the component unmounted.
- Calling `pause()` twice, or while stopped, broke the next `resume()`.
- `start()` while running and `reset()` sometimes didn't update the displayed time.
- `decorateTimeStamp` printed long decimals for fractional milliseconds.
- `main`/`module` fields pointed at the wrong builds.

## [1.1.3] - 2024-05-01

### Fixed
- Peer dependencies relaxed from exactly `18.2.0` to `^18.0.0`, so any React 18 version installs cleanly.
- Removed build-only packages that were wrongly listed as runtime dependencies.

## [1.1.2] - 2024-05-01

### Fixed
- Package exports, so `useStopwatch` and `decorateTimeStamp` can be imported correctly.

## [1.1.1] - 2024-02-07

### Changed
- Documentation for the hook and `decorateTimeStamp`.

## [1.1.0] - 2024-02-07

### Added
- `pause()` and `resume()`.

## [1.0.0] - 2024-02-06

### Added
- First release: `useStopwatch` with `start()`, `stop()` and `reset()`, and the `decorateTimeStamp` formatter.

[2.0.0]: https://github.com/Abhik-Ray/react-dead-simple-stopwatch-hook/compare/6ff5b49...v2.0.0
[1.1.3]: https://www.npmjs.com/package/react-dead-simple-stopwatch-hook/v/1.1.3
[1.1.2]: https://www.npmjs.com/package/react-dead-simple-stopwatch-hook/v/1.1.2
[1.1.1]: https://www.npmjs.com/package/react-dead-simple-stopwatch-hook/v/1.1.1
[1.1.0]: https://www.npmjs.com/package/react-dead-simple-stopwatch-hook/v/1.1.0
[1.0.0]: https://www.npmjs.com/package/react-dead-simple-stopwatch-hook/v/1.0.0
