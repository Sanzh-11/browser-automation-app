import "server-only"

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

// Pooled endpoint over HTTP: one round trip per query, no socket to keep alive,
// which is what request-scoped server code wants. Interactive transactions
// aren't available over HTTP — use db.batch() for multi-statement atomicity.
const sql = neon(process.env.DATABASE_URL)

export const db = drizzle({ client: sql, schema, casing: "snake_case" })

export * from "./schema"
