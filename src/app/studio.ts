import "dotenv/config";
import { Studio } from "@anvia/studio";
import { createIncidentApplication } from "./application.js";
import { loadRuntimeConfig } from "../config/runtime-config.js";

export async function startStudio() {
  const config = loadRuntimeConfig();
  const application = await createIncidentApplication(config);
  const studio = new Studio([application.agent, application.pipeline], {
    ui: {
      title: "Incident Triage Agent",
    },
  });

  studio.start({
    port: config.studioPort,
    handleSignals: false,
  });
  console.log(`Anvia Studio listening on http://localhost:${config.studioPort}`);

  const shutdown = async () => {
    studio.close();
    await application.close();
  };
  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());

  return { studio, application };
}
