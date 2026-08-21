import { and, desc, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { workflows } from "@/lib/db/schema"

export function listWorkflows(organizationId: string) {
  return db
    .select()
    .from(workflows)
    .where(eq(workflows.organizationId, organizationId))
    .orderBy(desc(workflows.createdAt))
}

export async function getWorkflow(organizationId: string, id: string) {
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(
      and(eq(workflows.id, id), eq(workflows.organizationId, organizationId))
    )
    .limit(1)

  return workflow
}

export async function createWorkflow(organizationId: string, name: string) {
  const [workflow] = await db
    .insert(workflows)
    .values({ organizationId, name })
    .returning()

  return workflow
}

// Scoped to the organization so a workflow id alone can't delete another org's
// row. Returns the deleted workflow, or undefined when there was nothing to
// delete.
export async function deleteWorkflow(organizationId: string, id: string) {
  const [workflow] = await db
    .delete(workflows)
    .where(
      and(eq(workflows.id, id), eq(workflows.organizationId, organizationId))
    )
    .returning()

  return workflow
}
