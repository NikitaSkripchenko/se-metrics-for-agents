import { spawn, type ChildProcess } from "node:child_process";
import net from "node:net";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { getEnvironmentConfig } from "./env.js";
import { waitForReady } from "./readiness.js";
import { resolveManagedTarget, type TargetName } from "./targets.js";

export type RunningServer = {
  name: string;
  baseUrl: string;
  stop: () => Promise<void>;
  logs: () => string;
};

export async function startConfiguredServer(): Promise<RunningServer> {
  const config = getEnvironmentConfig();

  if (config.baseUrl !== null) {
    return createExternalServer("external", config.baseUrl);
  }

  return startManagedServer(config.target ?? "baseline");
}

export async function startOracleServer(): Promise<RunningServer | null> {
  const config = getEnvironmentConfig();

  if (config.oracleBaseUrl !== null) {
    return createExternalServer("oracle", config.oracleBaseUrl);
  }

  if (config.oracleTarget !== null) {
    return await startManagedServer(config.oracleTarget);
  }

  return null;
}

export async function startManagedServer(targetName: TargetName): Promise<RunningServer> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await startManagedServerAttempt(targetName);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function startManagedServerAttempt(
  targetName: TargetName
): Promise<RunningServer> {
  const target = resolveManagedTarget(targetName);
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const output: string[] = [];

  const child = spawn(target.command, target.args, {
    cwd: target.cwd,
    env: {
      ...process.env,
      PORT: String(port)
    },
    detached: true,
    stdio: ["ignore", "pipe", "pipe"]
  });

  child.stdout?.setEncoding("utf8");
  child.stderr?.setEncoding("utf8");
  child.stdout?.on("data", (chunk) => {
    output.push(chunk);
  });
  child.stderr?.on("data", (chunk) => {
    output.push(chunk);
  });

  try {
    await waitForReady(baseUrl, {
      label: target.name,
      timeoutMs: 15_000,
      logs: () => output.join("")
    });
  } catch (error) {
    await stopChildProcess(child);
    throw error;
  }

  return {
    name: target.name,
    baseUrl,
    stop: async () => {
      await stopChildProcess(child);
    },
    logs: () => output.join("")
  };
}

function createExternalServer(name: string, baseUrl: string): RunningServer {
  return {
    name,
    baseUrl,
    stop: async () => {},
    logs: () => ""
  };
}

async function getFreePort(): Promise<number> {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();

  if (address === null || typeof address === "string") {
    server.close();
    throw new Error("Unable to allocate a TCP port.");
  }

  const port = address.port;
  server.close();
  await once(server, "close");
  return port;
}

async function stopChildProcess(child: ChildProcess): Promise<void> {
  if (child.pid === undefined || child.exitCode !== null) {
    return;
  }

  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (child.exitCode !== null) {
      return;
    }

    await delay(100);
  }

  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    child.kill("SIGKILL");
  }

  await once(child, "close");
}
