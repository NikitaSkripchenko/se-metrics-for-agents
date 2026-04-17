import { setTimeout as delay } from "node:timers/promises";

type WaitOptions = {
  timeoutMs?: number;
  label: string;
  logs?: () => string;
};

export async function waitForReady(
  baseUrl: string,
  options: WaitOptions
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(new URL("/tasks", baseUrl), {
        signal: AbortSignal.timeout(1_000)
      });

      if (response.status === 200) {
        return;
      }

      lastError = new Error(`Unexpected readiness status ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await delay(150);
  }

  const logs = options.logs?.();
  const logSuffix = logs !== undefined && logs.length > 0 ? `\nLogs:\n${logs}` : "";
  throw new Error(
    `Timed out waiting for ${options.label} at ${baseUrl}. Last error: ${String(
      lastError
    )}${logSuffix}`
  );
}
