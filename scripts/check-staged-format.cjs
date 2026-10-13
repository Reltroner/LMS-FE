"use strict";

let execFileSync;
let path;
let prettier;

const root = process.cwd();

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: root,
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
}

async function main() {
  ({ execFileSync } = await import("node:child_process"));
  path = await import("node:path");
  prettier = await import("prettier");
  const files = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"])
    .toString("utf8")
    .split("\0")
    .filter(Boolean);

  if (files.length === 0) {
    throw new Error("No staged files available for format validation.");
  }

  const failures = [];
  let checked = 0;

  for (const relative of files) {
    const absolute = path.resolve(root, relative);

    const info = await prettier.getFileInfo(absolute, {
      ignorePath: path.join(root, ".prettierignore"),
      resolveConfig: true,
    });

    if (info.ignored || !info.inferredParser) {
      continue;
    }

    const source = git(["show", `:${relative}`], {
      encoding: "utf8",
    });

    const config = (await prettier.resolveConfig(absolute)) ?? {};

    const formatted = await prettier.format(source, {
      ...config,
      filepath: absolute,
    });

    checked++;

    if (source !== formatted) {
      failures.push(relative);
      console.error(`FORMAT FAIL: ${relative}`);
    }
  }

  if (checked === 0) {
    throw new Error("No supported staged files were checked.");
  }

  if (failures.length > 0) {
    throw new Error(`${failures.length} staged files require formatting.`);
  }

  console.log(`Staged Prettier PASS: ${checked} files checked.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
