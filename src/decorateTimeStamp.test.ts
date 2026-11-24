import { describe, expect, it } from "vitest";
import { decorateTimeStamp } from "./decorateTimeStamp.ts";

describe("decorateTimeStamp", () => {
  it.each([
    [0, "00:00:000"],
    [1, "00:00:001"],
    [999, "00:00:999"],
    [1000, "00:01:000"],
    [59_999, "00:59:999"],
    [60_000, "01:00:000"],
    [61_234, "01:01:234"],
    [3_599_999, "59:59:999"],
  ])("formats %i ms as %s", (ms, expected) => {
    expect(decorateTimeStamp(ms)).toBe(expected);
  });

  it("keeps counting minutes past an hour", () => {
    expect(decorateTimeStamp(3_600_000)).toBe("60:00:000");
    expect(decorateTimeStamp(100 * 60_000)).toBe("100:00:000");
  });

  it("uses the absolute value of negative input", () => {
    expect(decorateTimeStamp(-1500)).toBe("00:01:500");
  });

  it("drops fractional milliseconds", () => {
    expect(decorateTimeStamp(1500.7)).toBe("00:01:500");
    expect(decorateTimeStamp(0.4)).toBe("00:00:000");
  });

  it("always returns three colon-separated parts", () => {
    for (const ms of [0, 12, 345, 6789, 123_456, 9_876_543]) {
      expect(decorateTimeStamp(ms)).toMatch(/^\d{2,}:\d{2}:\d{3}$/);
    }
  });
});
