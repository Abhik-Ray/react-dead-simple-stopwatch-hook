import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getChangelogSection } from "./changelog-section.mjs";

const sample = `# Changelog

Intro text.

## [Unreleased]

- Work in progress.

## [1.2.0] - 2026-01-15

### Added
- Something new.

### Fixed
- Something broken.

## [1.1.0] - Unreleased

- Not dated.

## [1.0.0] - 2025-06-01

- First release.

[1.2.0]: https://example.com/1.2.0
[1.0.0]: https://example.com/1.0.0
`;

describe("getChangelogSection", () => {
  it("returns only the requested section", () => {
    expect(getChangelogSection(sample, "1.2.0")).toBe(
      "### Added\n- Something new.\n\n### Fixed\n- Something broken.",
    );
  });

  it("stops at the link references for the last section", () => {
    expect(getChangelogSection(sample, "1.0.0")).toBe("- First release.");
  });

  it("fails for a missing version", () => {
    expect(() => getChangelogSection(sample, "9.9.9")).toThrow(/no "## \[9\.9\.9\]" section/);
  });

  it("fails when the section has no release date", () => {
    expect(() => getChangelogSection(sample, "1.1.0")).toThrow(/no release date/);
  });

  it("fails for an empty section", () => {
    expect(() => getChangelogSection("## [1.0.0] - 2025-06-01\n\n## [0.9.0] - 2025-01-01\n- x", "1.0.0")).toThrow(/empty/);
  });

  it("does not treat dots in the version as wildcards", () => {
    expect(() => getChangelogSection("## [1x2x0] - 2025-06-01\n- x", "1.2.0")).toThrow(/no "## \[1\.2\.0\]"/);
  });

  it("handles Windows line endings", () => {
    expect(getChangelogSection(sample.replace(/\n/g, "\r\n"), "1.0.0")).toBe("- First release.");
  });

  it("finds every dated release in the real CHANGELOG.md", () => {
    const changelog = readFileSync("CHANGELOG.md", "utf8");
    for (const version of ["1.1.3", "1.1.2", "1.1.1", "1.1.0", "1.0.0"]) {
      expect(getChangelogSection(changelog, version).length).toBeGreaterThan(0);
    }
  });
});
