import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

// Workflows belong to a Clerk organization; `organizationId` holds the Clerk
// org id (`org_...`) and `createdBy` the Clerk user id (`user_...`). Clerk stays
// the source of truth for both, so neither is a foreign key.
export const workflows = pgTable(
  "workflows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("org_id").notNull(),
    name: text("name").notNull(),
    graph: jsonb("graph"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index().on(table.organizationId)]
)

export type Workflow = typeof workflows.$inferSelect
export type NewWorkflow = typeof workflows.$inferInsert
