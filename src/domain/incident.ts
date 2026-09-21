export type ServiceStatus = "healthy" | "degraded";

export interface ServiceHealth {
  serviceName: string;
  status: ServiceStatus;
  latencyMs: number;
  errorRate: number;
}

export interface ServiceLog {
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  timestamp: string;
}

export interface DeploymentInfo {
  serviceName: string;
  version: string;
  deployedAt: string;
}

export interface IncidentScenario {
  health: ServiceHealth;
  logs: ServiceLog[];
  deployment: DeploymentInfo;
}

export interface IncidentService {
  checkHealth(serviceName: string): Promise<ServiceHealth>;
  getRecentLogs(serviceName: string): Promise<ServiceLog[]>;
  getRecentDeployment(serviceName: string): Promise<DeploymentInfo>;
}
