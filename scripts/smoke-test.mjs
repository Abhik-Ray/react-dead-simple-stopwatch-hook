// Checks the built package the way consumers load it: ESM import and CJS require,
// resolved through package.json "exports" (not by file path).
import { createRequire } from "node:module";
import assert from "node:assert/strict";

const name = "react-dead-simple-stopwatch-hook";
const require = createRequire(import.meta.url);

const esm = await import(name);
const cjs = require(name);

for (const [label, mod] of [["ESM", esm], ["CJS", cjs]]) {
  assert.equal(typeof mod.useStopwatch, "function", `${label}: useStopwatch missing`);
  assert.equal(typeof mod.decorateTimeStamp, "function", `${label}: decorateTimeStamp missing`);
  assert.equal(mod.decorateTimeStamp(61234), "01:01:234", `${label}: decorateTimeStamp output`);
  console.log(`✓ ${label} build loads and exports work`);
}
