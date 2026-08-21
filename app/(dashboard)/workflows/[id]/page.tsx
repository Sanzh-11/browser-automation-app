import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"

import { liveblocks } from "@/lib/liveblocks"
import { getWorkflow } from "@/features/workflows/data"
import { WorkflowShell } from "@/features/workflows/components/workflow-shell"
import { Room } from "@/features/workflows/components/room"
import { FlowProvider } from "@/features/workflows/components/flow-provider"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await auth.protect()

  const { id } = await params
  const { orgId } = await auth()
  if (!orgId) {
    notFound()
  }

  const workflow = await getWorkflow(orgId, id)
  if (!workflow) {
    notFound()
  }

  await liveblocks.getOrCreateRoom(id, {
    organizationId: orgId,
    defaultAccesses: [],
    groupsAccesses: { [orgId]: ["room:write"] },
  })

  return (
    <Room roomId={id}>
      <FlowProvider>
        <WorkflowShell workflowId={id} />
      </FlowProvider>
    </Room>
  )
}
