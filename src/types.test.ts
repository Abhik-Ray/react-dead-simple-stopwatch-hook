// Type-level tests: these are checked by `npm run typecheck` (tsc).
import { describe, expectTypeOf, it } from "vitest";
import {
  decorateTimeStamp,
  useStopwatch,
  type Lap,
  type TimerState,
  type UseStopwatchProps,
  type UseStopwatchReturn,
} from "./index.ts";

describe("public types", () => {
  it("useStopwatch accepts optional props and returns UseStopwatchReturn", () => {
    expectTypeOf(useStopwatch).parameter(0).toEqualTypeOf<UseStopwatchProps | undefined>();
    expectTypeOf(useStopwatch).returns.toEqualTypeOf<UseStopwatchReturn>();
  });

  it("return shape", () => {
    expectTypeOf<UseStopwatchReturn["currentTime"]>().toEqualTypeOf<number>();
    expectTypeOf<UseStopwatchReturn["startTime"]>().toEqualTypeOf<number>();
    expectTypeOf<UseStopwatchReturn["isTimerActive"]>().toEqualTypeOf<boolean | null>();
    expectTypeOf<UseStopwatchReturn["timerState"]>().toEqualTypeOf<TimerState>();
    expectTypeOf<TimerState>().toEqualTypeOf<"stopped" | "paused" | "resumed">();
    expectTypeOf<UseStopwatchReturn["start"]>().toEqualTypeOf<(customStartTime?: number) => void>();
    expectTypeOf<UseStopwatchReturn["stop"]>().toEqualTypeOf<() => void>();
    expectTypeOf<UseStopwatchReturn["lap"]>().toEqualTypeOf<() => Lap | undefined>();
    expectTypeOf<UseStopwatchReturn["laps"]>().toEqualTypeOf<Lap[]>();
    expectTypeOf<UseStopwatchReturn["currentLapTime"]>().toEqualTypeOf<number>();
  });

  it("Lap shape", () => {
    expectTypeOf<Lap>().toEqualTypeOf<{
      lap: number;
      lapTime: number;
      splitTime: number;
      timestamp: number;
    }>();
    expectTypeOf<NonNullable<UseStopwatchProps["onLap"]>>().parameters.toEqualTypeOf<[Lap]>();
  });

  it("callbacks receive a timestamp", () => {
    expectTypeOf<NonNullable<UseStopwatchProps["onStart"]>>().parameters.toEqualTypeOf<[number]>();
  });

  it("decorateTimeStamp is number -> string", () => {
    expectTypeOf(decorateTimeStamp).toEqualTypeOf<(ms: number) => string>();
  });
});
