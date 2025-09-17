import { defineConfig } from "drizzle-kit";
import { env } from "./src/app/data/env/server";

export default defineConfig({
  schema: "./src/app/drizzle/schema.ts",
  out: "./src/app/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
