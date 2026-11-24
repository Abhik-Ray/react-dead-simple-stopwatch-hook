import { StrictMode, useEffect } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decorateTimeStamp, useStopwatch } from "./index.ts";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

function Stopwatch({ interval }: { interval?: number }) {
  const { currentTime, timerState, start, stop, pause, resume, reset } = useStopwatch({
    options: { interval },
  });
  return (
    <div>
      <button onClick={() => start()}>start</button>
      <button onClick={stop}>stop</button>
      <button onClick={pause}>pause</button>
      <button onClick={resume}>resume</button>
      <button onClick={reset}>reset</button>
      <output data-testid="time">{decorateTimeStamp(currentTime)}</output>
      <span data-testid="state">{timerState}</span>
    </div>
  );
}

const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const time = () => screen.getByTestId("time").textContent;
const state = () => screen.getByTestId("state").textContent;

describe("in a real component", () => {
  it("drives a full user flow through the UI", () => {
    render(<Stopwatch />);
    expect(time()).toBe("00:00:000");
    expect(state()).toBe("stopped");

    click("start");
    advance(1250);
    expect(time()).toBe("00:01:250");

    click("pause");
    advance(3000);
    expect(time()).toBe("00:01:250");
    expect(state()).toBe("paused");

    click("resume");
    advance(61_000);
    expect(time()).toBe("01:02:250");

    click("reset");
    expect(time()).toBe("00:00:000");
    advance(10);
    expect(time()).toBe("00:00:010");

    click("stop");
    advance(1000);
    expect(time()).toBe("00:00:010");
    expect(state()).toBe("stopped");
  });

  it("works under StrictMode (double-invoked effects)", () => {
    render(
      <StrictMode>
        <Stopwatch />
      </StrictMode>,
    );
    click("start");
    advance(500);
    expect(time()).toBe("00:00:500");
    expect(vi.getTimerCount()).toBe(1);
    click("pause");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not leak intervals or warn after unmounting mid-run", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const { unmount } = render(<Stopwatch />);
    click("start");
    advance(100);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    advance(1000);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it("keeps independent instances separate", () => {
    render(
      <>
        <section data-testid="a"><Stopwatch /></section>
        <section data-testid="b"><Stopwatch /></section>
      </>,
    );
    const [startA] = screen.getAllByRole("button", { name: "start" });
    fireEvent.click(startA);
    advance(300);
    const times = screen.getAllByTestId("time").map((el) => el.textContent);
    expect(times).toEqual(["00:00:300", "00:00:000"]);
  });

  it("can be safely used in effect dependency arrays", () => {
    const effect = vi.fn();
    function WithEffect() {
      const { start, pause } = useStopwatch();
      useEffect(() => {
        effect();
      }, [start, pause]);
      return <button onClick={() => start()}>start</button>;
    }
    render(<WithEffect />);
    click("start");
    advance(1000);
    expect(effect).toHaveBeenCalledTimes(1);
  });
});
