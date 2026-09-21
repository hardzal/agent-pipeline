import { Pipeline } from "@anvia/core/pipeline";
import type { Agent } from "@anvia/core/agent";
import { z } from "zod";

export const IncidentInputSchema = z.object({
  prompt: z.string().trim().min(1),
  sessionId: z.string().trim().min(1),
  userId: z.string().trim().min(1).optional(),
});

export type IncidentInput = z.infer<typeof IncidentInputSchema>;

export function normalizeIncidentInput(input: IncidentInput): IncidentInput {
  return {
    ...input,
    prompt: input.prompt.trim(),
    sessionId: input.sessionId.trim(),
    ...(input.userId ? { userId: input.userId.trim() } : {}),
  };
}

export function createIncidentPipeline(agent: Agent) {
  return new Pipeline<IncidentInput>({
    id: "incident-triage-pipeline",
    name: "Incident Triage Pipeline",
    description: "Normalizes an incident prompt and delegates investigation.",
    inputSchema: IncidentInputSchema,
  })
    .step<IncidentInput>({
      id: "normalize-input",
      name: "Normalize input",
      run: ({ input }) => normalizeIncidentInput(input),
    })
    .agent({
      id: "investigate-incident",
      name: "Investigate incident",
      agent,
      suspension: "reject",
      request: ({ input }) => ({
        prompt: input.prompt,
        session: {
          sessionId: input.sessionId,
          ...(input.userId ? { userId: input.userId } : {}),
        },
      }),
    });
}
