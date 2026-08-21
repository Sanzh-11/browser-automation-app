"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { tasks } from "@trigger.dev/sdk"

import { liveblocks } from "@/lib/liveblocks"
import type { helloWorldTask } from "@/src/trigger/example"

import { createWorkflow, deleteWorkflow } from "./data"

export async function createWorkflowAction(name: string) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  const workflow = await createWorkflow(orgId, name)

  revalidatePath("/workflows", "layout")

  redirect(`/workflows/${workflow.id}`)
}

export async function runWorkflowAction(workflowId: string) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  const handle = await tasks.trigger<typeof helloWorldTask>("hello-world", {
    message: `Running workflow ${workflowId}`,
  })

  return { runId: handle.id, publicAccessToken: handle.publicAccessToken }
}

export async function deleteWorkflowAction(workflowId: string) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  const workflow = await deleteWorkflow(orgId, workflowId)

  if (!workflow) {
    throw new Error("Workflow not found")
  }

  // The canvas' Liveblocks room is keyed by the workflow id, so it goes with
  // the row. The database is the source of truth here — an orphaned room is
  // worth logging, but not worth failing a delete that already happened.
  try {
    await liveblocks.deleteRoom(workflowId)
  } catch (error) {
    console.error(`Failed to delete Liveblocks room ${workflowId}`, error)
  }

  revalidatePath("/", "layout")

  redirect("/")
}
