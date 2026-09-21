import type { IncidentScenario } from "../domain/incident.js";

export const MOCK_INCIDENT_SCENARIOS: Record<string, IncidentScenario> = {
  "payment-service": {
    health: {
      serviceName: "payment-service",
      status: "degraded",
      latencyMs: 1450,
      errorRate: 0.18,
    },
    logs: [
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
    ],
    deployment: {
      serviceName: "payment-service",
      version: "v1.4.2",
      deployedAt: "2026-09-21T08:20:00Z",
    },
  },
  "auth-service": {
    health: {
      serviceName: "auth-service",
      status: "healthy",
      latencyMs: 85,
      errorRate: 0.002,
    },
    logs: [
      {
        level: "INFO",
        message: "no recent errors",
        timestamp: "2026-09-21T08:32:00Z",
      },
    ],
    deployment: {
      serviceName: "auth-service",
      version: "v2.1.0",
      deployedAt: "2026-09-19T08:20:00Z",
    },
  },
  "notification-service": {
    health: {
      serviceName: "notification-service",
      status: "degraded",
      latencyMs: 700,
      errorRate: 0.07,
    },
    logs: [
      {
        level: "ERROR",
        message: "external provider timeout",
        timestamp: "2026-09-20T08:32:00Z",
      },
    ],
    deployment: {
      serviceName: "notification-service",
      version: "v3.0.1",
      deployedAt: "2026-09-20T08:20:00Z",
    },
  },
};

export function listMockServices(): string[] {
  return Object.keys(MOCK_INCIDENT_SCENARIOS);
}
