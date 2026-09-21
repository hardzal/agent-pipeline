import { createTool } from "@anvia/core/tool";
import { z } from "zod";
import type {
  DeploymentInfo,
  IncidentService,
  ServiceHealth,
  ServiceLog,
} from "../domain/incident.js";

const serviceNameSchema = z.object({
  serviceName: z.string().trim().min(1),
});

const serviceHealthSchema = z.object({
  serviceName: z.string(),
  status: z.enum(["healthy", "degraded"]),
  latencyMs: z.number(),
  errorRate: z.number(),
});

const serviceLogSchema = z.object({
  level: z.enum(["INFO", "WARN", "ERROR"]),
  message: z.string(),
  timestamp: z.string(),
});

const deploymentSchema = z.object({
  serviceName: z.string(),
  version: z.string(),
  deployedAt: z.string(),
});

export function createIncidentTools({ service }: { service: IncidentService }) {
  const checkServiceHealth = createTool({
    name: "check_service_health",
    description: "Check the current health status of a backend service.",
    inputSchema: serviceNameSchema,
    outputSchema: serviceHealthSchema,
    execute: async ({ serviceName }): Promise<ServiceHealth> =>
      service.checkHealth(serviceName),
  });

  const getRecentLogs = createTool({
    name: "get_recent_logs",
    description: "Get the most recent application logs for a backend service.",
    inputSchema: serviceNameSchema,
    outputSchema: z.array(serviceLogSchema),
    execute: async ({ serviceName }): Promise<ServiceLog[]> =>
      service.getRecentLogs(serviceName),
  });

  const getRecentDeployment = createTool({
    name: "get_recent_deployment",
    description: "Get the latest deployment information for a backend service.",
    inputSchema: serviceNameSchema,
    outputSchema: deploymentSchema,
    execute: async ({ serviceName }): Promise<DeploymentInfo> =>
      service.getRecentDeployment(serviceName),
  });

  return [checkServiceHealth, getRecentLogs, getRecentDeployment] as const;
}
