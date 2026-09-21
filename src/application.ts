import type { Agent } from "@anvia/core/agent";
import type { Pipeline } from "@anvia/core/pipeline";
import type { Logger } from "@anvia/logger";
import { createIncidentAgent } from "./agents.js";
import { loadRuntimeConfig, type RuntimeConfig } from "./config.js";
import { createDatabase, type Database } from "./db.js";
import { createIncidentLogger } from "./logger.js";
import { createMemoryStore, validateMemoryStore } from "./memory.js";
import { createModel } from "./models.js";
import {
  createIncidentPipeline,
  type IncidentInput,
} from "./pipeline.js";

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
