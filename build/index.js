import { useState as d, useRef as o, useEffect as M } from "react";
function g(t) {
  var m;
  const [l, a] = d(Date.now()), [e, r] = d(null), c = o(((m = t == null ? void 0 : t.options) == null ? void 0 : m.customStartTime) || Date.now()), u = o(0), i = o(0), n = o(null), f = () => {
    const s = Date.now();
    t != null && t.onStart && (t == null || t.onStart(s)), a(s), r(!0), c.current = s, n.current = null;
  }, S = () => {
    const s = Date.now();
    t != null && t.onReset && (t == null || t.onReset(s)), a(s), c.current = s, n.current = null;
  }, T = () => {
    t != null && t.onStop && (t == null || t.onStop(Date.now())), r(null);
  }, w = () => {
    r(!1), u.current = Date.now();
  }, D = () => {
    if (e === null) {
      console.error("Timer not intialized, please use start method first");
      return;
    }
    i.current = i.current + u.current - Date.now(), r(!0);
  };
  return M(() => {
    !n.current && e && (n.current = setInterval(() => {
      a(Date.now());
    }, 1)), n.current && !e && (clearInterval(n.current), n.current = null);
  }, [e]), {
    currentTime: l - c.current + i.current,
    startTime: c.current,
    timerRef: n,
    isTimerActive: e,
    timerState: e === null ? "stopped" : e ? "resumed" : "paused",
    reset: S,
    start: f,
    stop: T,
    pause: w,
    resume: D
  };
}
const v = (t) => {
  t = Math.abs(t);
  const l = Math.floor(t / (60 * 1e3)), a = Math.floor(t % (60 * 1e3) / 1e3), e = t % 1e3, r = String(l).padStart(2, "0"), c = String(a).padStart(2, "0"), u = String(e).padStart(3, "0");
  return `${r}:${c}:${u}`;
};
export {
  v as decorateTimeStamp,
  g as useStopwatch
};
