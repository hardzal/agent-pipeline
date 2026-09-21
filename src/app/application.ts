import type { Agent } from "@anvia/core/agent";
import type { Pipeline } from "@anvia/core/pipeline";
import type { Logger } from "@anvia/logger";
import { createIncidentAgent } from "../agents/incident-agent.js";
import {
  loadRuntimeConfig,
  type RuntimeConfig,
} from "../config/runtime-config.js";
import {
  createDatabase,
  type Database,
} from "../infrastructure/persistence/database.js";
import { createIncidentLogger } from "../infrastructure/observability/logger.js";
import {
  createMemoryStore,
  validateMemoryStore,
} from "../infrastructure/persistence/memory-store.js";
import { createModel } from "../infrastructure/model/openai-completion-model.js";
import {
  createIncidentPipeline,
  type IncidentInput,
} from "../pipeline/incident-pipeline.js";

export interface IncidentApplication {
  database: Database;
  logger: Logger;
  agent: Agent;
  pipeline: Pipeline<IncidentInput, string>;
  close(): Promise<void>;
}

export async function createIncidentApplication(
  config: RuntimeConfig = loadRuntimeConfig(),
): Promise<IncidentApplication> {
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is required to bootstrap the application");
  }

  const database = createDatabase(config.databaseUrl);
  try {
    const memoryStore = createMemoryStore(database);
    await validateMemoryStore(memoryStore);

    const logger = createIncidentLogger();
    const model = createModel(config);
    const agent = createIncidentAgent({
      model,
      memory: memoryStore,
      logger,
    });
    const pipeline = createIncidentPipeline(agent);

    return {
      database,
      logger,
      agent,
      pipeline,
      async close() {
        await logger.flush?.();
        await database.close();
      },
    };
  } catch (error) {
    await database.close();
    throw error;
  }
}
