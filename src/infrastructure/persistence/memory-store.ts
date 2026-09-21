import { PrismaMemoryStore } from "@anvia/memory-prisma/v8";
import type { MemoryStore } from "@anvia/core/memory";
import type { Database } from "./database.js";

export function createMemoryStore(database: Database): PrismaMemoryStore {
  return new PrismaMemoryStore({
    client: database,
    schema: "public",
  });
}

export async function validateMemoryStore(
  memoryStore: MemoryStore,
): Promise<void> {
  if (!("validate" in memoryStore) || typeof memoryStore.validate !== "function") {
    throw new Error("Configured memory store does not support validation");
  }

  await memoryStore.validate();
}
