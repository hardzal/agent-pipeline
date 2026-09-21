import {
  createLoggerObserver,
  createPinoLogger,
  type Logger,
} from "@anvia/logger";

export function createIncidentLogger(): Logger {
  return createPinoLogger({
    name: "incident-triage-agent",
    level: "info",
  });
}

export function createIncidentObserver(logger: Logger) {
  return createLoggerObserver({
    logger,
    includeOutput: true,
    includeToolResult: true,
  });
}
