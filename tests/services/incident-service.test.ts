import { describe, expect, it } from "vitest";
import { MockIncidentService } from "../../src/services/incident-service.js";

describe("MockIncidentService", () => {
  const service = new MockIncidentService();

  it("returns the deterministic payment incident health", async () => {
    await expect(service.checkHealth("payment-service")).resolves.toEqual({
      serviceName: "payment-service",
      status: "degraded",
      latencyMs: 1450,
      errorRate: 0.18,
    });
  });

  it("returns logs and deployment for a known service", async () => {
    await expect(service.getRecentLogs("payment-service")).resolves.toEqual([
      {
        level: "ERROR",
        message: "database connection timeout",
        timestamp: "2026-09-21T08:31:00Z",
      },
      {
        level: "ERROR",
        message: "failed to acquire database connection",
        timestamp: "2026-09-21T08:32:00Z",
      },
    ]);

    await expect(
      service.getRecentDeployment("payment-service"),
    ).resolves.toEqual({
      serviceName: "payment-service",
      version: "v1.4.2",
      deployedAt: "2026-09-21T08:20:00Z",
    });
  });

  it("rejects unknown services instead of inventing data", async () => {
    await expect(service.checkHealth("unknown-service")).rejects.toThrow(
      /Unknown service/,
    );
  });
});
