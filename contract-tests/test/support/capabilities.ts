import { getEnvironmentConfig } from "./env.js";

export type ContractCapabilities = {
  profile: "full" | "smoke";
  stateSensitiveAssertions: boolean;
  deterministicOverduePositiveAssertions: boolean;
  parityAvailable: boolean;
  requiredEndpoints: readonly string[];
};

export function getCapabilities(): ContractCapabilities {
  const config = getEnvironmentConfig();

  return {
    profile: config.profile,
    stateSensitiveAssertions: config.profile === "full",
    deterministicOverduePositiveAssertions: false,
    parityAvailable:
      config.profile === "full" &&
      (config.oracleTarget !== null || config.oracleBaseUrl !== null),
    requiredEndpoints: [
      "POST /tasks",
      "GET /tasks",
      "GET /tasks/:id",
      "PATCH /tasks/:id",
      "PATCH /tasks/:id/status",
      "DELETE /tasks/:id",
      "GET /tasks/summary"
    ]
  };
}
