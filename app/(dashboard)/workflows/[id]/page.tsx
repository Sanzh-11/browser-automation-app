import { auth } from "@clerk/nextjs/server"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await auth.protect()

  const { id } = await params

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1 p-6">
      <p className="text-sm text-muted-foreground">Workflow</p>
      <h1 className="font-heading text-lg font-medium tracking-tight">{id}</h1>
    </div>
  )
}
