import postgres from "@prisma/orm-postgres/runtime";
import contractJson from "./prisma/generated/contract.json" with {
  type: "json",
};
import type { Contract } from "./prisma/generated/contract.js";

export function createDatabase(databaseUrl: string) {
  return postgres<Contract>({
    url: databaseUrl,
    contractJson,
  });
}

export type Database = ReturnType<typeof createDatabase>;
