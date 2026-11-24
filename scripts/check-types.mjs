// Runs "Are The Types Wrong?" on exactly the files npm would publish.
// attw's own tarball reader can't read npm 11 tarballs, so we ask npm for the
// file list and hand the files to attw's checker directly.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { checkPackage, Package } from "@arethetypeswrong/core";

const [{ files }] = JSON.parse(execSync("npm pack --dry-run --json", { encoding: "utf8" }));
const { name, version } = JSON.parse(readFileSync("package.json", "utf8"));

const fileMap = Object.fromEntries(
  files.map(({ path }) => [
    `/node_modules/${name}/${path.replaceAll("\\", "/")}`,
    new Uint8Array(readFileSync(path)),
  ]),
);

const result = await checkPackage(new Package(fileMap, name, version));

if (!result.types) {
  console.error("✗ attw: no type declarations found");
  process.exit(1);
}

if (result.problems.length > 0) {
  console.error("✗ attw found type resolution problems:");
  for (const p of result.problems) console.error(" ", JSON.stringify(p));
  process.exit(1);
}

const modes = Object.keys(result.entrypoints["."].resolutions).join(", ");
console.log(`✓ attw: types resolve correctly (${modes})`);
