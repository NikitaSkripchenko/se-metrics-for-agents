import path from "node:path";
import { defineConfig } from "vitest/config";

const reportDir = process.env.REPORT_DIR;
const targetName =
  process.env.TARGET ??
  (process.env.BASE_URL !== undefined && process.env.BASE_URL !== "/"
    ? "external"
    : "baseline");

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.spec.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
    reporters: reportDir === undefined ? ["default"] : ["default", "json"],
    outputFile:
      reportDir === undefined
        ? undefined
        : {
            json: path.join(reportDir, `${targetName}.json`)
          }
  }
});
