import { spawn } from "node:child_process";
import { Socket } from "node:net";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const children = new Set();
let shuttingDown = false;

const prefixStream = (stream, label, writer) => {
  let buffer = "";

  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.trim()) {
        writer.write(`[${label}] ${line}\n`);
      }
    }
  });

  stream.on("end", () => {
    if (buffer.trim()) {
      writer.write(`[${label}] ${buffer}\n`);
    }
  });
};

const stopAll = (exitCode = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => process.exit(exitCode), 200);
};

const start = (label, args) => {
  const command = isWindows ? process.env.ComSpec || "cmd.exe" : npmCommand;
  const commandArgs = isWindows ? ["/d", "/s", "/c", npmCommand, ...args] : args;
  const child = spawn(command, commandArgs, {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  children.add(child);
  prefixStream(child.stdout, label, process.stdout);
  prefixStream(child.stderr, label, process.stderr);

  child.on("exit", (code, signal) => {
    children.delete(child);

    if (!shuttingDown) {
      const exitCode = code ?? (signal ? 1 : 0);
      process.stderr.write(`[dev] ${label} exited; stopping dev servers.\n`);
      stopAll(exitCode);
    }
  });
};

const waitForPort = (port, host = "127.0.0.1", timeoutMs = 20000) =>
  new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      const socket = new Socket();

      socket.setTimeout(1000);
      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.once("timeout", () => {
        socket.destroy();
        retry();
      });
      socket.once("error", () => {
        socket.destroy();
        retry();
      });
      socket.connect(port, host);
    };

    const retry = () => {
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error(`Timed out waiting for ${host}:${port}`));
        return;
      }

      setTimeout(check, 250);
    };

    check();
  });

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));

start("api", ["--prefix", "backend", "run", "dev"]);

waitForPort(Number(process.env.PORT || 5000))
  .then(() => start("vite", ["run", "dev:frontend"]))
  .catch((error) => {
    process.stderr.write(`[dev] ${error.message}; starting Vite anyway.\n`);
    start("vite", ["run", "dev:frontend"]);
  });
