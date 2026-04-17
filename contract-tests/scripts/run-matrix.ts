import { mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const targets = ["baseline", "compact", "clean", "fragmented"] as const;
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const workspace = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const reportDir = path.join(workspace, "reports");

mkdirSync(reportDir, { recursive: true });

const results: Array<{ target: string; code: number | null }> = [];

for (const target of targets) {
  const code = await runTarget(target);
  results.push({ target, code });
}

for (const result of results) {
  const outcome = result.code === 0 ? "PASS" : "FAIL";
  console.log(`${outcome} ${result.target}`);
}

if (results.some((result) => result.code !== 0)) {
  process.exit(1);
}

async function runTarget(target: (typeof targets)[number]): Promise<number | null> {
  console.log(`\n==> Running contract tests for ${target}`);

  return await new Promise((resolve) => {
    const child = spawn(npmCommand, ["run", "test"], {
      cwd: workspace,
      stdio: "inherit",
      env: {
        ...process.env,
        TARGET: target,
        REPORT_DIR: reportDir
      }
    });

    child.on("close", (code) => {
      resolve(code);
    });
  });
}
