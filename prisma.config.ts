import "dotenv/config";
import { defineConfig } from "@prisma/orm-postgres/config";
import { definePrismaConfig } from "prisma/config";

export default definePrismaConfig({
  orm: defineConfig({
    contract: "src/infrastructure/persistence/prisma/contract.prisma",
    output: "src/infrastructure/persistence/prisma/generated",
    db: {
      connection: process.env.DATABASE_URL,
    },
  }),
});
