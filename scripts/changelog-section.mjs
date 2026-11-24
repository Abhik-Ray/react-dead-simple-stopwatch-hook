// Prints the CHANGELOG.md section for one version, for use as GitHub release notes.
// Usage: node scripts/changelog-section.mjs 2.0.0
// Fails if the version is missing or still marked "Unreleased", so a release
// can't go out without its changelog entry and date.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function getChangelogSection(changelog, version) {
  const lines = changelog.split(/\r?\n/);
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const heading = new RegExp(`^## \\[${escaped}\\](.*)$`);

  const startIndex = lines.findIndex((line) => heading.test(line));
  if (startIndex === -1) {
    throw new Error(`CHANGELOG.md has no "## [${version}]" section.`);
  }

  const suffix = lines[startIndex].match(heading)[1];
  if (!/\d{4}-\d{2}-\d{2}/.test(suffix)) {
    throw new Error(
      `CHANGELOG.md section for ${version} has no release date ("${lines[startIndex]}"). ` +
        `Change it to "## [${version}] - YYYY-MM-DD".`,
    );
  }

  // The section ends at the next version heading or the link references at the bottom.
  const rest = lines.slice(startIndex + 1);
  const endOffset = rest.findIndex((line) => /^## \[/.test(line) || /^\[[^\]]+\]: /.test(line));
  const body = (endOffset === -1 ? rest : rest.slice(0, endOffset)).join("\n").trim();

  if (body === "") {
    throw new Error(`CHANGELOG.md section for ${version} is empty.`);
  }
  return body;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const version = process.argv[2]?.replace(/^v/, "");
  if (!version) {
    console.error("Usage: node scripts/changelog-section.mjs <version>");
    process.exit(1);
  }
  try {
    console.log(getChangelogSection(readFileSync("CHANGELOG.md", "utf8"), version));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
