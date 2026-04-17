import path from "node:path";
import { fileURLToPath } from "node:url";

export type TargetName = "baseline" | "compact" | "clean" | "fragmented";

export type ManagedTarget = {
  name: TargetName;
  cwd: string;
  command: string;
  args: string[];
};

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.."
);

const managedTargets: Record<TargetName, ManagedTarget> = {
  baseline: createTarget("baseline"),
  compact: createTarget("compact"),
  clean: createTarget("clean"),
  fragmented: createTarget("fragmented")
};

export function resolveManagedTarget(name: TargetName): ManagedTarget {
  return managedTargets[name];
}

function createTarget(name: TargetName): ManagedTarget {
  return {
    name,
    cwd: path.join(workspaceRoot, name),
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args: ["run", "dev"]
  };
}
