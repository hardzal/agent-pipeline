import { describe, expect, it } from "vitest";
import {
  IncidentInputSchema,
  normalizeIncidentInput,
} from "../src/pipeline.js";

describe("incident pipeline input", () => {
  it("accepts a session-scoped prompt and trims it", () => {
    const input = IncidentInputSchema.parse({
      prompt: "  Cek payment-service.  ",
      sessionId: "incident-001",
      userId: "student-001",
    });

    expect(normalizeIncidentInput(input)).toEqual({
      prompt: "Cek payment-service.",
      sessionId: "incident-001",
      userId: "student-001",
    });
  });

  it("rejects an empty prompt or session id", () => {
    expect(() =>
      IncidentInputSchema.parse({ prompt: "", sessionId: "incident-001" }),
    ).toThrow();
    expect(() =>
      IncidentInputSchema.parse({ prompt: "Cek service", sessionId: "" }),
    ).toThrow();
  });
});
