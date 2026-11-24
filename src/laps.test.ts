import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStopwatch, type Lap } from "./useStopwatch.tsx";

const T0 = 1_000_000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(T0);
});

afterEach(() => {
  vi.useRealTimers();
});

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe("laps", () => {
  it("starts with no laps", () => {
    const { result } = renderHook(() => useStopwatch());
    expect(result.current.laps).toEqual([]);
    expect(result.current.currentLapTime).toBe(0);
  });

  it("records lap and split times, oldest first", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(1000);
    act(() => void result.current.lap());
    advance(1500);
    act(() => void result.current.lap());
    advance(700);
    act(() => void result.current.lap());

    expect(result.current.laps).toEqual<Lap[]>([
      { lap: 1, lapTime: 1000, splitTime: 1000, timestamp: T0 + 1000 },
      { lap: 2, lapTime: 1500, splitTime: 2500, timestamp: T0 + 2500 },
      { lap: 3, lapTime: 700, splitTime: 3200, timestamp: T0 + 3200 },
    ]);
  });

  it("lap times always add up to the last split", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    for (const ms of [123, 4567, 89, 1000, 1]) {
      advance(ms);
      act(() => void result.current.lap());
    }
    const { laps } = result.current;
    const sum = laps.reduce((total, l) => total + l.lapTime, 0);
    expect(sum).toBe(laps[laps.length - 1].splitTime);
  });

  it("returns the new lap", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(400);
    let returned: Lap | undefined;
    act(() => {
      returned = result.current.lap();
    });
    expect(returned).toEqual({ lap: 1, lapTime: 400, splitTime: 400, timestamp: T0 + 400 });
  });

  it("syncs currentTime to the lap's split immediately", () => {
    const { result } = renderHook(() => useStopwatch({ options: { interval: 1000 } }));
    act(() => result.current.start());
    advance(1000);
    vi.setSystemTime(T0 + 1300); // between ticks
    act(() => void result.current.lap());
    expect(result.current.currentTime).toBe(1300);
    expect(result.current.currentLapTime).toBe(0);
  });

  it("currentLapTime counts up from the last lap", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(1000);
    expect(result.current.currentLapTime).toBe(1000);
    act(() => void result.current.lap());
    advance(250);
    expect(result.current.currentTime).toBe(1250);
    expect(result.current.currentLapTime).toBe(250);
  });

  it("excludes paused time from lap times", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(500);
    act(() => void result.current.lap());
    advance(200);
    act(() => result.current.pause());
    advance(10_000);
    expect(result.current.currentLapTime).toBe(200);
    act(() => result.current.resume());
    advance(300);
    act(() => void result.current.lap());
    expect(result.current.laps[1]).toMatchObject({ lapTime: 500, splitTime: 1000 });
  });

  it("does nothing unless running", () => {
    const onLap = vi.fn();
    const { result } = renderHook(() => useStopwatch({ onLap }));
    let returned: Lap | undefined = undefined;

    act(() => {
      returned = result.current.lap(); // never started
    });
    expect(returned).toBeUndefined();

    act(() => result.current.start());
    advance(100);
    act(() => result.current.pause());
    act(() => {
      returned = result.current.lap(); // paused
    });
    expect(returned).toBeUndefined();

    act(() => result.current.resume());
    act(() => result.current.stop());
    act(() => {
      returned = result.current.lap(); // stopped
    });
    expect(returned).toBeUndefined();

    expect(result.current.laps).toEqual([]);
    expect(onLap).not.toHaveBeenCalled();
  });

  it("stop() keeps laps", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(300);
    act(() => void result.current.lap());
    advance(200);
    act(() => result.current.stop());
    expect(result.current.laps).toHaveLength(1);
    expect(result.current.currentLapTime).toBe(200);
  });

  it("start() clears laps", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(300);
    act(() => void result.current.lap());
    act(() => result.current.stop());
    act(() => result.current.start());
    expect(result.current.laps).toEqual([]);
    advance(100);
    act(() => void result.current.lap());
    expect(result.current.laps[0]).toMatchObject({ lap: 1, lapTime: 100, splitTime: 100 });
  });

  it("reset() clears laps and keeps running", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(300);
    act(() => void result.current.lap());
    act(() => result.current.reset());
    expect(result.current.laps).toEqual([]);
    expect(result.current.currentLapTime).toBe(0);
    advance(50);
    act(() => void result.current.lap());
    expect(result.current.laps[0]).toMatchObject({ lap: 1, lapTime: 50, splitTime: 50 });
  });

  it("calls onLap with the new lap, using the latest callback", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook((p: { onLap: (l: Lap) => void }) => useStopwatch(p), {
      initialProps: { onLap: first },
    });
    act(() => result.current.start());
    advance(100);
    rerender({ onLap: second });
    act(() => void result.current.lap());
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith({ lap: 1, lapTime: 100, splitTime: 100, timestamp: T0 + 100 });
  });

  it("records two laps in the same millisecond", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(100);
    act(() => {
      result.current.lap();
      result.current.lap();
    });
    expect(result.current.laps.map((l) => [l.lap, l.lapTime, l.splitTime])).toEqual([
      [1, 100, 100],
      [2, 0, 100],
    ]);
  });

  it("works with a past start time", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start(T0 - 5000));
    act(() => void result.current.lap());
    expect(result.current.laps[0]).toMatchObject({ lapTime: 5000, splitTime: 5000 });
  });

  it("keeps lap() stable across renders", () => {
    const { result } = renderHook(() => useStopwatch());
    const before = result.current.lap;
    act(() => result.current.start());
    advance(50);
    act(() => void result.current.lap());
    expect(result.current.lap).toBe(before);
  });
});
