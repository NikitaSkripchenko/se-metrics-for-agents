import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getCapabilities } from "../support/capabilities.js";
import { FUTURE_DAY_A, FUTURE_DAY_C } from "../support/dates.js";
import { getEnvironmentConfig } from "../support/env.js";
import { ApiClient, type ApiResponse } from "../support/http.js";
import {
  normalizeError,
  normalizeSummary,
  normalizeTask,
  normalizeTasks
} from "../support/normalize.js";
import { createScenarioContext } from "../support/scenario.js";
import {
  startConfiguredServer,
  startOracleServer,
  type RunningServer
} from "../support/server.js";
import type { ErrorResponse, Task, TaskSummary } from "../support/types.js";

const capabilities = getCapabilities();
const config = getEnvironmentConfig();
const parityEnabled =
  capabilities.parityAvailable &&
  !(config.target === null && config.baseUrl === null) &&
  config.target !== "baseline";
const parityIt = parityEnabled ? it : it.skip;

describe("baseline parity", () => {
  let targetServer: RunningServer | undefined;
  let oracleServer: RunningServer | null;
  let targetClient: ApiClient;
  let oracleClient: ApiClient;

  beforeEach(async () => {
    targetServer = await startConfiguredServer();
    oracleServer = await startOracleServer();

    if (oracleServer === null) {
      throw new Error("Parity mode requires an oracle target or oracle base URL.");
    }

    targetClient = new ApiClient(targetServer.baseUrl);
    oracleClient = new ApiClient(oracleServer.baseUrl);
  });

  afterEach(async () => {
    await targetServer?.stop();
    await oracleServer?.stop();
  });

  parityIt("matches baseline for a representative HTTP scenario", async () => {
    const targetScenario = createScenarioContext();
    const oracleScenario = createScenarioContext();

    const alphaPayload = {
      title: "Alpha draft",
      description: "Contract parity",
      priority: "high",
      dueDate: FUTURE_DAY_A
    };
    const betaPayload = {
      title: "Beta review",
      priority: "medium",
      dueDate: FUTURE_DAY_C
    };
    const gammaPayload = {
      title: "Gamma done",
      priority: "low",
      dueDate: FUTURE_DAY_A
    };

    await expectTaskParity(
      await oracleClient.post<Task>("/tasks", alphaPayload),
      await targetClient.post<Task>("/tasks", alphaPayload),
      oracleScenario,
      targetScenario,
      "alpha"
    );
    await expectTaskParity(
      await oracleClient.post<Task>("/tasks", betaPayload),
      await targetClient.post<Task>("/tasks", betaPayload),
      oracleScenario,
      targetScenario,
      "beta"
    );
    await expectTaskParity(
      await oracleClient.post<Task>("/tasks", gammaPayload),
      await targetClient.post<Task>("/tasks", gammaPayload),
      oracleScenario,
      targetScenario,
      "gamma"
    );

    await expectTaskParity(
      await oracleClient.patch<Task>(`/tasks/${oracleScenario.id("beta")}`, {
        title: "Beta revised"
      }),
      await targetClient.patch<Task>(`/tasks/${targetScenario.id("beta")}`, {
        title: "Beta revised"
      }),
      oracleScenario,
      targetScenario
    );

    await expectTaskParity(
      await oracleClient.patch<Task>(`/tasks/${oracleScenario.id("gamma")}/status`, {
        status: "done"
      }),
      await targetClient.patch<Task>(`/tasks/${targetScenario.id("gamma")}/status`, {
        status: "done"
      }),
      oracleScenario,
      targetScenario
    );

    const oracleList = await oracleClient.get<Task[]>("/tasks");
    const targetList = await targetClient.get<Task[]>("/tasks");
    expect(targetList.status).toBe(oracleList.status);
    expect(
      normalizeTasks(targetList.body ?? [], (id) => targetScenario.labelFor(id))
    ).toEqual(
      normalizeTasks(oracleList.body ?? [], (id) => oracleScenario.labelFor(id))
    );

    const oracleSummary = await oracleClient.get<TaskSummary>("/tasks/summary");
    const targetSummary = await targetClient.get<TaskSummary>("/tasks/summary");
    expect(targetSummary.status).toBe(oracleSummary.status);
    expect(normalizeSummary(targetSummary.body as TaskSummary)).toEqual(
      normalizeSummary(oracleSummary.body as TaskSummary)
    );

    const oracleError = await oracleClient.patch<ErrorResponse>(
      `/tasks/${oracleScenario.id("gamma")}/status`,
      { status: "in_progress" }
    );
    const targetError = await targetClient.patch<ErrorResponse>(
      `/tasks/${targetScenario.id("gamma")}/status`,
      { status: "in_progress" }
    );
    expect(targetError.status).toBe(oracleError.status);
    expect(normalizeError(targetError.body as ErrorResponse)).toEqual(
      normalizeError(oracleError.body as ErrorResponse)
    );
  });
});

async function expectTaskParity(
  oracleResponse: ApiResponse<Task>,
  targetResponse: ApiResponse<Task>,
  oracleScenario: ReturnType<typeof createScenarioContext>,
  targetScenario: ReturnType<typeof createScenarioContext>,
  label?: string
): Promise<void> {
  expect(targetResponse.status).toBe(oracleResponse.status);

  if (label !== undefined) {
    oracleScenario.remember(label, oracleResponse.body as Task);
    targetScenario.remember(label, targetResponse.body as Task);
  }

  expect(
    normalizeTask(targetResponse.body as Task, (id) => targetScenario.labelFor(id))
  ).toEqual(
    normalizeTask(oracleResponse.body as Task, (id) => oracleScenario.labelFor(id))
  );
}
