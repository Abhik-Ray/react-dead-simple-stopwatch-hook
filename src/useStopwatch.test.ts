import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStopwatch } from "./useStopwatch.tsx";


beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(1_000_000);
});

afterEach(() => {
  vi.useRealTimers();
});

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe("useStopwatch", () => {
  it("starts stopped at zero", () => {
    const { result } = renderHook(() => useStopwatch());
    expect(result.current.currentTime).toBe(0);
    expect(result.current.timerState).toBe("stopped");
    expect(result.current.isTimerActive).toBeNull();
  });

  it("counts elapsed time while running", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(1500);
    expect(result.current.currentTime).toBe(1500);
    expect(result.current.timerState).toBe("resumed");
  });

  it("excludes paused time", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(1000);
    act(() => result.current.pause());
    advance(5000);
    expect(result.current.currentTime).toBe(1000);
    expect(result.current.timerState).toBe("paused");
    act(() => result.current.resume());
    advance(500);
    expect(result.current.currentTime).toBe(1500);
  });

  it("does not carry paused time into a restart", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(1000);
    act(() => result.current.pause());
    advance(3000);
    act(() => result.current.resume());
    act(() => result.current.stop());
    act(() => result.current.start());
    advance(200);
    expect(result.current.currentTime).toBe(200);
  });

  it("freezes on stop and ignores pause time when stopped while paused", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(700);
    act(() => result.current.pause());
    advance(2000);
    act(() => result.current.stop());
    advance(2000);
    expect(result.current.currentTime).toBe(700);
    expect(result.current.timerState).toBe("stopped");
  });

  it("ignores repeated pause calls", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(1000);
    act(() => result.current.pause());
    advance(1000);
    act(() => result.current.pause());
    act(() => result.current.resume());
    advance(100);
    expect(result.current.currentTime).toBe(1100);
  });

  it("resume before start logs an error and does nothing", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.resume());
    expect(spy).toHaveBeenCalled();
    expect(result.current.timerState).toBe("stopped");
    spy.mockRestore();
  });

  it("reset zeroes the time but keeps running", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    advance(1000);
    act(() => result.current.reset());
    expect(result.current.currentTime).toBe(0);
    advance(300);
    expect(result.current.currentTime).toBe(300);
    expect(result.current.timerState).toBe("resumed");
  });

  it("uses options.customStartTime on the first start", () => {
    const { result } = renderHook(() =>
      useStopwatch({ options: { customStartTime: 1_000_000 - 5000 } }),
    );
    act(() => result.current.start());
    expect(result.current.currentTime).toBe(5000);
    act(() => result.current.stop());
    act(() => result.current.start());
    expect(result.current.currentTime).toBe(0);
  });

  it("accepts a custom start time in start()", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start(Date.now() - 2000));
    expect(result.current.currentTime).toBe(2000);
  });

  it("calls lifecycle callbacks with the event timestamp", () => {
    const onStart = vi.fn();
    const onPause = vi.fn();
    const onResume = vi.fn();
    const onStop = vi.fn();
    const onReset = vi.fn();
    const { result } = renderHook(() =>
      useStopwatch({ onStart, onPause, onResume, onStop, onReset }),
    );
    act(() => result.current.start());
    act(() => result.current.pause());
    act(() => result.current.resume());
    act(() => result.current.reset());
    act(() => result.current.stop());
    for (const fn of [onStart, onPause, onResume, onStop, onReset]) {
      expect(fn).toHaveBeenCalledWith(1_000_000);
    }
  });

  it("keeps function identities stable across renders", () => {
    const { result } = renderHook(() => useStopwatch());
    const first = result.current;
    act(() => result.current.start());
    advance(100);
    expect(result.current.start).toBe(first.start);
    expect(result.current.pause).toBe(first.pause);
  });

  it("clears the interval on unmount", () => {
    const { result, unmount } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("respects options.interval", () => {
    const { result } = renderHook(() =>
      useStopwatch({ options: { interval: 1000 } }),
    );
    act(() => result.current.start());
    advance(999);
    expect(result.current.currentTime).toBe(0);
    advance(1);
    expect(result.current.currentTime).toBe(1000);
  });
});

