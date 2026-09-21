import { describe, expect, it } from "vitest";
import { MockIncidentService } from "../../src/services/incident-service.js";
import { createIncidentTools } from "../../src/tools/incident-tools.js";

describe("incident tools", () => {
  const tools = createIncidentTools({ service: new MockIncidentService() });

  it("exposes the three planned tool names", () => {
    expect(tools.map((tool) => tool.name)).toEqual([
      "check_service_health",
      "get_recent_logs",
      "get_recent_deployment",
    ]);
  });

  it("delegates health lookup through the service contract", async () => {
    const healthTool = tools[0];

    await expect(healthTool.call({ serviceName: "auth-service" })).resolves.toEqual(
      {
        serviceName: "auth-service",
        status: "healthy",
        latencyMs: 85,
        errorRate: 0.002,
      },
    );
  });

  it("validates tool input before calling the service", async () => {
    const healthTool = tools[0];

    await expect(
      healthTool.call({ serviceName: "" }),
    ).rejects.toThrow();
  });
});
