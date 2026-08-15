import { existsSync } from "node:fs"

import { defineConfig } from "drizzle-kit"

// drizzle-kit runs outside Next.js, so it has to load the env file itself.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local")
}

// Migrations need a direct connection: the pooled endpoint runs through
// PgBouncer in transaction mode and can't hold the session state DDL relies on.
const url = process.env.DATABASE_URL_UNPOOLED

if (!url) {
  throw new Error("DATABASE_URL_UNPOOLED is not set")
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
  casing: "snake_case",
})
