"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createWorkflow } from "./data"

export async function createWorkflowAction(name: string) {
  const { orgId } = await auth()

  // Workflows are scoped to a Clerk organization, so there is nothing to write
  // to without an active one. Users without an org are sent to
  // /choose-organization before they reach the dashboard.
  if (!orgId) {
    throw new Error("No active organization")
  }

  const workflow = await createWorkflow(orgId, name)

  // The workflow list renders in the sidebar, which lives in the dashboard
  // layout rather than any one page — revalidating the layout refreshes it
  // wherever the user triggered this from.
  revalidatePath("/workflows", "layout")

  // redirect() throws, so it has to stay after the revalidation.
  redirect(`/workflows/${workflow.id}`)
}
