import { useRef as a, useState as A, useReducer as _, useCallback as f, useEffect as j } from "react";
const q = 10;
function B(s = {}) {
  var b;
  const n = a(s);
  n.current = s;
  const [o, g] = A(null), [R, u] = A(() => Date.now()), [, h] = _((t) => t + 1, 0), c = a(null), l = a(R), p = a(0), w = a(null), d = a(0), L = a(!1), v = a(null), [M, x] = A([]), i = a([]), D = (t) => {
    c.current = t, g(t);
  }, I = () => {
    i.current = [], x(i.current);
  }, N = f((t) => {
    var m, S, T;
    const e = Date.now(), r = L.current || (m = n.current.options) == null ? void 0 : m.customStartTime;
    L.current = !0, l.current = t ?? r ?? e, d.current = 0, w.current = null, I(), u(e), D(!0), h(), (T = (S = n.current).onStart) == null || T.call(S, e);
  }, []), P = f(() => {
    var e, r;
    if (c.current === null)
      return;
    const t = Date.now();
    w.current = c.current === !1 ? p.current : t, u(t), D(null), (r = (e = n.current).onStop) == null || r.call(e, t);
  }, []), k = f(() => {
    var e, r;
    if (c.current !== !0)
      return;
    const t = Date.now();
    p.current = t, u(t), D(!1), (r = (e = n.current).onPause) == null || r.call(e, t);
  }, []), z = f(() => {
    var e, r;
    if (c.current === null) {
      console.error("Timer not initialized, please use start method first");
      return;
    }
    if (c.current === !0)
      return;
    const t = Date.now();
    d.current += t - p.current, u(t), D(!0), (r = (e = n.current).onResume) == null || r.call(e, t);
  }, []), C = f(() => {
    var e, r;
    const t = Date.now();
    l.current = t, d.current = 0, c.current === !1 && (p.current = t), c.current === null && (w.current = t), I(), u(t), h(), (r = (e = n.current).onReset) == null || r.call(e, t);
  }, []), F = f(() => {
    var S, T;
    if (c.current !== !0)
      return;
    const t = Date.now(), e = Math.max(
      0,
      t - l.current - d.current
    ), r = i.current[i.current.length - 1], m = {
      lap: i.current.length + 1,
      lapTime: e - ((r == null ? void 0 : r.splitTime) ?? 0),
      splitTime: e,
      timestamp: t
    };
    return i.current = [...i.current, m], x(i.current), u(t), (T = (S = n.current).onLap) == null || T.call(S, m), m;
  }, []), E = ((b = s.options) == null ? void 0 : b.interval) ?? q;
  j(() => {
    if (o !== !0)
      return;
    const t = setInterval(() => u(Date.now()), E);
    return v.current = t, () => {
      clearInterval(t), v.current = null;
    };
  }, [o, E]);
  const U = o === !0 ? R : o === !1 ? p.current : w.current ?? l.current, $ = Math.max(0, U - l.current - d.current), V = M.length > 0 ? M[M.length - 1].splitTime : 0;
  return {
    currentTime: $,
    startTime: l.current,
    isTimerActive: o,
    timerRef: v,
    timerState: o === null ? "stopped" : o ? "resumed" : "paused",
    start: N,
    stop: P,
    pause: k,
    resume: z,
    reset: C,
    lap: F,
    laps: M,
    currentLapTime: Math.max(0, $ - V)
  };
}
const G = (s) => {
  s = Math.floor(Math.abs(s));
  const n = Math.floor(s / (60 * 1e3)), o = Math.floor(s % (60 * 1e3) / 1e3), g = s % 1e3, R = String(n).padStart(2, "0"), u = String(o).padStart(2, "0"), h = String(g).padStart(3, "0");
  return `${R}:${u}:${h}`;
};
export {
  G as decorateTimeStamp,
  B as useStopwatch
};
