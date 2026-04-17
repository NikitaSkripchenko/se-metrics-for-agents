import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ApiClient } from "../support/http.js";
import { startConfiguredServer, type RunningServer } from "../support/server.js";
import type { ErrorResponse } from "../support/types.js";

describe("error envelope contract", () => {
  let server: RunningServer | undefined;
  let client: ApiClient;

  beforeEach(async () => {
    server = await startConfiguredServer();
    client = new ApiClient(server.baseUrl);
  });

  afterEach(async () => {
    await server?.stop();
  });

  it("returns the contracted payload for unknown routes", async () => {
    const response = await client.get<ErrorResponse>("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "NOT_FOUND",
      message: "Requested route was not found."
    });
  });
});
