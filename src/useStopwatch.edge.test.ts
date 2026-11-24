import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStopwatch, type UseStopwatchProps } from "./useStopwatch.tsx";

const T0 = 1_000_000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(T0);
});

afterEach(() => {
  vi.useRealTimers();
});

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe("useStopwatch: state transitions", () => {
  it("handles many pause/resume cycles", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    for (let i = 0; i < 10; i++) {
      advance(100); // running
      act(() => result.current.pause());
      advance(1000); // paused, should not count
      act(() => result.current.resume());
    }
    expect(result.current.currentTime).toBe(1000);
  });

  it("start() while running restarts from zero", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(800);
    act(() => result.current.start());
    expect(result.current.currentTime).toBe(0);
    advance(50);
    expect(result.current.currentTime).toBe(50);
  });

  it("start() while paused restarts and runs", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(800);
    act(() => result.current.pause());
    advance(800);
    act(() => result.current.start());
    expect(result.current.timerState).toBe("resumed");
    advance(100);
    expect(result.current.currentTime).toBe(100);
  });

  it("resume() after stop logs an error and stays stopped", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(300);
    act(() => result.current.stop());
    act(() => result.current.resume());
    expect(spy).toHaveBeenCalledOnce();
    expect(result.current.timerState).toBe("stopped");
    advance(500);
    expect(result.current.currentTime).toBe(300);
    spy.mockRestore();
  });

  it("resume() while running is a no-op", () => {
    const onResume = vi.fn();
    const { result } = renderHook(() => useStopwatch({ onResume }));
    act(() => result.current.start());
    advance(100);
    act(() => result.current.resume());
    advance(100);
    expect(result.current.currentTime).toBe(200);
    expect(onResume).not.toHaveBeenCalled();
  });

  it("pause() and stop() before start are no-ops", () => {
    const onPause = vi.fn();
    const onStop = vi.fn();
    const { result } = renderHook(() => useStopwatch({ onPause, onStop }));
    act(() => result.current.pause());
    act(() => result.current.stop());
    expect(result.current.timerState).toBe("stopped");
    expect(onPause).not.toHaveBeenCalled();
    expect(onStop).not.toHaveBeenCalled();
  });

  it("stop() twice only fires onStop once", () => {
    const onStop = vi.fn();
    const { result } = renderHook(() => useStopwatch({ onStop }));
    act(() => result.current.start());
    act(() => result.current.stop());
    act(() => result.current.stop());
    expect(onStop).toHaveBeenCalledOnce();
  });

  it("reset() while paused zeroes time and stays paused", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(500);
    act(() => result.current.pause());
    advance(500);
    act(() => result.current.reset());
    expect(result.current.currentTime).toBe(0);
    expect(result.current.timerState).toBe("paused");
    advance(500);
    expect(result.current.currentTime).toBe(0);
    act(() => result.current.resume());
    advance(250);
    expect(result.current.currentTime).toBe(250);
  });

  it("reset() while stopped zeroes the frozen time", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(500);
    act(() => result.current.stop());
    expect(result.current.currentTime).toBe(500);
    act(() => result.current.reset());
    expect(result.current.currentTime).toBe(0);
    expect(result.current.timerState).toBe("stopped");
  });

  it("reset() clears accumulated pause time", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(100);
    act(() => result.current.pause());
    advance(5000);
    act(() => result.current.resume());
    act(() => result.current.reset());
    advance(300);
    expect(result.current.currentTime).toBe(300);
  });
});

describe("useStopwatch: returned values", () => {
  it("isTimerActive matches timerState", () => {
    const { result } = renderHook(() => useStopwatch());
    expect([result.current.isTimerActive, result.current.timerState]).toEqual([null, "stopped"]);
    act(() => result.current.start());
    expect([result.current.isTimerActive, result.current.timerState]).toEqual([true, "resumed"]);
    act(() => result.current.pause());
    expect([result.current.isTimerActive, result.current.timerState]).toEqual([false, "paused"]);
    act(() => result.current.resume());
    expect([result.current.isTimerActive, result.current.timerState]).toEqual([true, "resumed"]);
    act(() => result.current.stop());
    expect([result.current.isTimerActive, result.current.timerState]).toEqual([null, "stopped"]);
  });

  it("startTime reflects when counting began", () => {
    const { result } = renderHook(() => useStopwatch());
    advance(1000);
    act(() => result.current.start());
    expect(result.current.startTime).toBe(T0 + 1000);
    act(() => result.current.start(T0 - 42));
    expect(result.current.startTime).toBe(T0 - 42);
  });

  it("timerRef holds an interval only while running", () => {
    const { result } = renderHook(() => useStopwatch());
    expect(result.current.timerRef.current).toBeNull();
    act(() => result.current.start());
    expect(result.current.timerRef.current).not.toBeNull();
    act(() => result.current.pause());
    expect(result.current.timerRef.current).toBeNull();
    act(() => result.current.resume());
    expect(result.current.timerRef.current).not.toBeNull();
    act(() => result.current.stop());
    expect(result.current.timerRef.current).toBeNull();
  });

  it("only ever has one interval running", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    act(() => result.current.start());
    act(() => result.current.pause());
    act(() => result.current.resume());
    act(() => result.current.reset());
    expect(vi.getTimerCount()).toBe(1);
    act(() => result.current.stop());
    expect(vi.getTimerCount()).toBe(0);
  });

  it("never reports negative time for a future customStartTime", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start(T0 + 10_000));
    advance(100);
    expect(result.current.currentTime).toBe(0);
  });

  it("stays accurate when ticks are delayed (no drift)", () => {
    const { result } = renderHook(() => useStopwatch({ options: { interval: 1000 } }));
    act(() => result.current.start());
    // Clock jumps (e.g. a background tab) without the interval firing.
    vi.setSystemTime(T0 + 4321);
    advance(1000);
    expect(result.current.currentTime).toBe(5321);
  });

  it("does not re-render while stopped", () => {
    let renders = 0;
    renderHook(() => {
      renders++;
      return useStopwatch();
    });
    const before = renders;
    advance(5000);
    expect(renders).toBe(before);
  });

  it("updates roughly once per interval while running", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useStopwatch({ options: { interval: 100 } });
    });
    act(() => result.current.start());
    const before = renders;
    for (let i = 0; i < 10; i++) advance(100);
    expect(renders - before).toBe(10);
  });
});

describe("useStopwatch: props changes", () => {
  it("uses the latest callbacks without changing function identity", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook((p: UseStopwatchProps) => useStopwatch(p), {
      initialProps: { onStart: first },
    });
    const startBefore = result.current.start;
    rerender({ onStart: second });
    expect(result.current.start).toBe(startBefore);
    act(() => result.current.start());
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(T0);
  });

  it("picks up a changed interval while running", () => {
    const { result, rerender } = renderHook(
      (p: UseStopwatchProps) => useStopwatch(p),
      { initialProps: { options: { interval: 1000 } } },
    );
    act(() => result.current.start());
    rerender({ options: { interval: 10 } });
    advance(10);
    expect(result.current.currentTime).toBe(10);
    expect(vi.getTimerCount()).toBe(1);
  });

  it("works with no props object at all", () => {
    const { result } = renderHook(() => useStopwatch(undefined));
    act(() => result.current.start());
    advance(20);
    expect(result.current.currentTime).toBe(20);
  });
});

describe("useStopwatch: callbacks", () => {
  it("fires each callback once per transition, in order", () => {
    const calls: string[] = [];
    const log = (name: string) => () => void calls.push(name);
    const { result } = renderHook(() =>
      useStopwatch({
        onStart: log("start"),
        onPause: log("pause"),
        onResume: log("resume"),
        onReset: log("reset"),
        onStop: log("stop"),
      }),
    );
    act(() => result.current.start());
    act(() => result.current.pause());
    act(() => result.current.pause());
    act(() => result.current.resume());
    act(() => result.current.resume());
    act(() => result.current.reset());
    act(() => result.current.stop());
    act(() => result.current.stop());
    expect(calls).toEqual(["start", "pause", "resume", "reset", "stop"]);
  });

  it("passes the event timestamp, not elapsed time", () => {
    const onStop = vi.fn();
    const { result } = renderHook(() => useStopwatch({ onStop }));
    act(() => result.current.start());
    advance(1234);
    act(() => result.current.stop());
    expect(onStop).toHaveBeenCalledWith(T0 + 1234);
  });
});
