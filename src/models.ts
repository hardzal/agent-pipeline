import { OpenAIClient } from "@anvia/openai";
import type { CompletionModel } from "@anvia/core/completion";
import type { RuntimeConfig } from "./config.js";

export function createModel(config: RuntimeConfig): CompletionModel {
  if (
    config.mode !== "live" ||
    !config.openaiApiKey ||
    !config.openaiBaseUrl ||
    !config.modelId
  ) {
    throw new Error("A live runtime configuration is required to create a model");
  }

  const client = new OpenAIClient({
    apiKey: config.openaiApiKey,
    baseUrl: config.openaiBaseUrl,
  });

  return client.completionModel({
    modelId: config.modelId,
    api: "chat",
  });
}
