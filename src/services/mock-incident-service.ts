import type {
  DeploymentInfo,
  IncidentScenario,
  IncidentService,
  ServiceHealth,
  ServiceLog,
} from "../domain/incident.js";
import { MOCK_INCIDENT_SCENARIOS } from "./mock-incident-scenarios.js";

export class MockIncidentService implements IncidentService {
  private scenarioFor(serviceName: string): IncidentScenario {
    const scenario = MOCK_INCIDENT_SCENARIOS[serviceName];
    if (!scenario) {
      throw new Error(`Unknown service: ${serviceName}`);
    }
    return scenario;
  }

  async checkHealth(serviceName: string): Promise<ServiceHealth> {
    return structuredClone(this.scenarioFor(serviceName).health);
  }

  async getRecentLogs(serviceName: string): Promise<ServiceLog[]> {
    return structuredClone(this.scenarioFor(serviceName).logs);
  }

  async getRecentDeployment(serviceName: string): Promise<DeploymentInfo> {
    return structuredClone(this.scenarioFor(serviceName).deployment);
  }
}

export { listMockServices } from "./mock-incident-scenarios.js";
