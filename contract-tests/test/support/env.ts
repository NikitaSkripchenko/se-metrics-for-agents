import { resolveManagedTarget, type TargetName } from "./targets.js";

export type ContractProfile = "full" | "smoke";

export type EnvironmentConfig = {
  target: TargetName | null;
  baseUrl: string | null;
  profile: ContractProfile;
  oracleTarget: TargetName | null;
  oracleBaseUrl: string | null;
};

let cachedConfig: EnvironmentConfig | undefined;

export function getEnvironmentConfig(): EnvironmentConfig {
  if (cachedConfig !== undefined) {
    return cachedConfig;
  }

  const target = parseOptionalTarget(process.env.TARGET) ?? "baseline";
  const baseUrl = parseOptionalUrl(process.env.BASE_URL);

  if (baseUrl !== null && process.env.TARGET !== undefined) {
    throw new Error("Set either BASE_URL or TARGET, but not both.");
  }

  const profile = parseProfile(
    process.env.CONTRACT_PROFILE,
    baseUrl === null ? "full" : "smoke"
  );

  const oracleTarget =
    parseOptionalTarget(process.env.ORACLE_TARGET) ??
    (baseUrl === null && target !== "baseline" ? "baseline" : null);
  const oracleBaseUrl = parseOptionalUrl(process.env.ORACLE_BASE_URL);

  if (oracleTarget !== null && oracleBaseUrl !== null) {
    throw new Error("Set either ORACLE_BASE_URL or ORACLE_TARGET, but not both.");
  }

  if (baseUrl !== null) {
    cachedConfig = {
      target: null,
      baseUrl,
      profile,
      oracleTarget,
      oracleBaseUrl
    };

    return cachedConfig;
  }

  resolveManagedTarget(target);

  cachedConfig = {
    target,
    baseUrl: null,
    profile,
    oracleTarget,
    oracleBaseUrl
  };

  return cachedConfig;
}

export function resetEnvironmentConfig(): void {
  cachedConfig = undefined;
}

function parseOptionalTarget(value: string | undefined): TargetName | null {
  if (value === undefined) {
    return null;
  }

  const normalized = value.trim() as TargetName;

  if (["baseline", "compact", "clean", "fragmented"].includes(normalized)) {
    return normalized;
  }

  throw new Error(`Unsupported target '${value}'.`);
}

function parseOptionalUrl(value: string | undefined): string | null {
  if (value === undefined || value.trim().length === 0) {
    return null;
  }

  const trimmed = value.trim();

  // Vite injects a relative BASE_URL value for app builds. Treat that as absent.
  if (trimmed === "/") {
    return null;
  }

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    throw new Error(`Expected an absolute URL, received '${value}'.`);
  }

  const normalized = new URL(trimmed).toString();

  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

function parseProfile(
  value: string | undefined,
  fallback: ContractProfile
): ContractProfile {
  if (value === undefined) {
    return fallback;
  }

  if (value === "full" || value === "smoke") {
    return value;
  }

  throw new Error(`Unsupported CONTRACT_PROFILE '${value}'.`);
}
