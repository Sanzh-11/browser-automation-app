import { auth } from "@clerk/nextjs/server"

import { WorkflowShell } from "@/features/workflows/components/workflow-shell"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await auth.protect()

  const { id } = await params

  return <WorkflowShell workflowId={id} />
}
