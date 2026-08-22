import { and, desc, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { WorkflowGraph, workflows } from "@/lib/db/schema"
import { validateGraph } from "@/features/workflows/lib/validate-graph"

export async function saveWorkflowGraph({
  organizationId,
  id,
  graph,
}: {
  organizationId: string
  id: string
  graph: WorkflowGraph
}) {
  const problems = validateGraph(graph)

  if (problems.length > 0) {
    throw new Error(problems.join("\n"))
  }

  await db
    .update(workflows)
    .set({ graph, updatedAt: new Date() })
    .where(
      and(eq(workflows.id, id), eq(workflows.organizationId, organizationId))
    )
}

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
