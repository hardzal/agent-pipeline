import "dotenv/config";
import { pathToFileURL } from "node:url";
import { createIncidentApplication } from "./application.js";
import { loadRuntimeConfig, type RuntimeMode } from "./config.js";
import { IncidentInputSchema } from "./pipeline.js";

export interface RunnerOptions {
  prompt: string;
  sessionId: string;
  userId?: string;
  json: boolean;
  mode?: RuntimeMode;
}

export function parseRunnerArgs(argv: string[]): RunnerOptions | null {
  const options: RunnerOptions = {
    prompt: "Payment-service lambat sejak deployment pagi tadi. Investigasi.",
    sessionId: "incident-demo",
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") {
      continue;
    }

    switch (arg) {
      case "--help":
      case "-h":
        printHelp();
        return null;
      case "--prompt":
        options.prompt = requiredValue(argv, ++index, arg);
        break;
      case "--session-id":
        options.sessionId = requiredValue(argv, ++index, arg);
        break;
      case "--user-id":
        options.userId = requiredValue(argv, ++index, arg);
        break;
      case "--mode":
        options.mode = requiredValue(argv, ++index, arg) as RuntimeMode;
        break;
      case "--json":
        options.json = true;
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

export async function runIncident(options: RunnerOptions): Promise<void> {
  const config = loadRuntimeConfig(process.env, options.mode);
  const input = IncidentInputSchema.parse({
    prompt: options.prompt,
    sessionId: options.sessionId,
    userId: options.userId,
  });
  const application = await createIncidentApplication(config);

  try {
    const result = await application.pipeline.run({ input });
    if (options.json) {
      console.log(
        JSON.stringify(
          {
            runId: result.runId,
            pipelineId: application.pipeline.id,
            input,
            output: result.output,
          },
          null,
          2,
        ),
      );
    } else {
      console.log(result.output);
    }
  } finally {
    await application.close();
  }
}

function requiredValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function printHelp(): void {
  console.log(`Incident Triage Agent runner

Usage:
  pnpm runner -- --prompt "Cek payment-service" --session-id incident-demo

Options:
  --prompt <text>       Incident prompt (default: payment-service demo)
  --session-id <id>     Persistent memory session id
  --user-id <id>        Optional user id for the memory scope
  --mode <live|mock>    Runtime mode override; live requires provider/database
  --json                Print a machine-readable result
  --help                Show this help
`);
}

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  try {
    const options = parseRunnerArgs(process.argv.slice(2));
    if (options) {
      await runIncident(options);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
