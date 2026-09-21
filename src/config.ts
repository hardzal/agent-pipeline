import { z } from "zod";

export const runtimeModeSchema = z.enum(["live", "mock"]);
export type RuntimeMode = z.infer<typeof runtimeModeSchema>;

const configSchema = z.object({
  mode: runtimeModeSchema,
  openaiApiKey: z.string().trim().optional(),
  openaiBaseUrl: z.string().trim().url().optional(),
  modelId: z.string().trim().min(1).optional(),
  databaseUrl: z.string().trim().min(1).optional(),
  studioPort: z.coerce.number().int().min(1).max(65535),
});

export type RuntimeConfig = z.infer<typeof configSchema>;

export function loadRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
  modeOverride?: RuntimeMode,
): RuntimeConfig {
  const mode = modeOverride ?? runtimeModeSchema.parse(env.AGENT_MODE ?? "live");
  const result = configSchema.safeParse({
    mode,
    openaiApiKey: emptyToUndefined(env.OPENAI_API_KEY),
    openaiBaseUrl: emptyToUndefined(
      env.OPENAI_API_BASE_URL ?? env.OPENAI_BASE_URL,
    ),
    modelId: emptyToUndefined(env.LLM_MODEL),
    databaseUrl: emptyToUndefined(env.DATABASE_URL),
    studioPort: env.STUDIO_PORT ?? "4021",
  });

  if (!result.success) {
    throw new Error(
      `Invalid runtime configuration: ${result.error.issues
        .map((issue) => issue.path.join(".") || "config")
        .join(", ")}`,
    );
  }

  const config = result.data;
  if (config.mode === "live") {
    const missing = [
      ["OPENAI_API_KEY", config.openaiApiKey],
      ["OPENAI_API_BASE_URL", config.openaiBaseUrl],
      ["LLM_MODEL", config.modelId],
      ["DATABASE_URL", config.databaseUrl],
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);

    if (missing.length > 0) {
      throw new Error(
        `Live mode requires configuration fields: ${missing.join(", ")}`,
      );
    }
  }

  return config;
}

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}
