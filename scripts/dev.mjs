import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const commands = [
  ["contentlayer", ["run", "contentlayer:dev"]],
  ["next", ["run", "dev:next"]],
];

let shuttingDown = false;

const children = commands.map(([name, args]) => {
  const child = spawn(npmCommand, args, {
    stdio: "inherit",
    windowsHide: true,
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const status = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    console.error(`${name} exited with ${status}`);
    stopAll(code ?? 1);
  });

  return child;
});

function stopAll(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  setTimeout(() => process.exit(exitCode), 100).unref();
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
