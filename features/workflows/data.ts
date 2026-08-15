import { desc, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { workflows } from "@/lib/db/schema"

export function listWorkflows(organizationId: string) {
  return db
    .select()
    .from(workflows)
    .where(eq(workflows.organizationId, organizationId))
    .orderBy(desc(workflows.createdAt))
}

export async function createWorkflow(organizationId: string, name: string) {
  const [workflow] = await db
    .insert(workflows)
    .values({ organizationId, name })
    .returning()

  return workflow
}
