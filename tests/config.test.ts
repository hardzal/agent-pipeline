import { describe, expect, it } from "vitest";
import { loadRuntimeConfig } from "../src/config.js";

describe("loadRuntimeConfig", () => {
  it("allows mock configuration without provider or database secrets", () => {
    expect(
      loadRuntimeConfig({ AGENT_MODE: "mock", STUDIO_PORT: "4021" }, "mock"),
    ).toMatchObject({
      mode: "mock",
      studioPort: 4021,
    });
  });

  it("reports missing live fields without exposing secret values", () => {
    expect(() =>
      loadRuntimeConfig(
        {
          AGENT_MODE: "live",
          OPENAI_API_KEY: "secret-that-must-not-appear",
        },
        "live",
      ),
    ).toThrow(/OPENAI_API_BASE_URL|LLM_MODEL|DATABASE_URL/);
  });

  it("accepts the canonical base URL and model fields", () => {
    expect(
      loadRuntimeConfig({
        OPENAI_API_KEY: "key",
        OPENAI_API_BASE_URL: "https://api.example.com/v1",
        LLM_MODEL: "example-model",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      }),
    ).toMatchObject({
      mode: "live",
      openaiBaseUrl: "https://api.example.com/v1",
      modelId: "example-model",
    });
  });
});
