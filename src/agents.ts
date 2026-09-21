import { Agent } from "@anvia/core/agent";
import { createSummaryMemoryCompactor } from "@anvia/core/memory";
import type { MemoryStore } from "@anvia/core/memory";
import type { CompletionModel } from "@anvia/core/completion";
import {
  createIncidentLogger,
  createIncidentObserver,
} from "./logger.js";
import { memoryCompactionInstructions, incidentAgentInstructions } from "./prompts.js";
import {
  MockIncidentService,
  type IncidentService,
} from "./services/incident-service.js";
import { createIncidentTools } from "./tools/incident-tools.js";

export interface IncidentAgentDependencies {
  model: CompletionModel;
  memory?: MemoryStore;
  service?: IncidentService;
  logger?: ReturnType<typeof createIncidentLogger>;
}

export function createIncidentAgent({
  model,
  memory,
  service = new MockIncidentService(),
  logger = createIncidentLogger(),
}: IncidentAgentDependencies): Agent {
  const memoryOptions = memory
    ? {
        store: memory,
        savePolicy: "turn" as const,
        compaction: {
          trigger: {
            afterTokens: 2000,
          },
          retention: {
            recentTurns: 2,
          },
          compactor: createSummaryMemoryCompactor({
            model,
            instructions: memoryCompactionInstructions,
            maxTokens: 800,
          }),
        },
      }
    : undefined;

  return new Agent({
    id: "incident-triage-agent",
    name: "Incident Triage Agent",
    description: "Investigates backend service incidents with bounded tool use.",
    model,
    instructions: incidentAgentInstructions,
    tools: createIncidentTools({ service }),
    maxTurns: 5,
    observability: {
      observers: {
        logger: createIncidentObserver(logger),
      },
    },
    ...(memoryOptions ? { memory: memoryOptions } : {}),
  });
}
