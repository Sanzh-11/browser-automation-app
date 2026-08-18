"use client"

import { useState, useTransition } from "react"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import {
  CheckCircle2Icon,
  Loader2Icon,
  PlayIcon,
  XCircleIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { helloWorldTask } from "@/src/trigger/example"

// Everything else is still in flight, so the Run button stays disabled and the
// status keeps ticking.
const FINISHED_STATUSES = new Set([
  "COMPLETED",
  "CANCELED",
  "FAILED",
  "CRASHED",
  "INTERRUPTED",
  "SYSTEM_FAILURE",
  "EXPIRED",
  "TIMED_OUT",
])

type RunHandle = {
  runId: string
  publicAccessToken: string
}

type RightSidebarProps = {
  workflowId: string
  // Passed down from the server component that renders the shell, matching how
  // the app sidebar receives createWorkflowAction.
  runWorkflowAction: (workflowId: string) => Promise<RunHandle>
}

function RightSidebar({ workflowId, runWorkflowAction }: RightSidebarProps) {
  const [isStarting, startRun] = useTransition()
  const [handle, setHandle] = useState<RunHandle | null>(null)

  // The hook has to be called unconditionally, so it is gated with `enabled`
  // rather than by rendering it only once a run exists. `payload` is skipped
  // because nothing here renders it.
  const { run, error } = useRealtimeRun<typeof helloWorldTask>(
    handle?.runId ?? "",
    {
      accessToken: handle?.publicAccessToken,
      enabled: handle !== null,
      skipColumns: ["payload"],
    }
  )

  const isFinished = run ? FINISHED_STATUSES.has(run.status) : false
  // Between the action returning and the first realtime update there is no run
  // yet, which still counts as in flight.
  const isRunning = isStarting || (handle !== null && !isFinished)

  // The action only dispatches the run — it returns as soon as Trigger.dev has
  // accepted it, and the subscription above reports what happens after that.
  const runWorkflow = () => {
    startRun(async () => {
      try {
        setHandle(await runWorkflowAction(workflowId))
      } catch (cause) {
        toast.error("Couldn't start the workflow run", {
          description: cause instanceof Error ? cause.message : undefined,
        })
      }
    })
  }

  return (
    <div className="flex size-full flex-col gap-3 p-2">
      <Button onClick={runWorkflow} disabled={isRunning}>
        {isRunning ? <Loader2Icon className="animate-spin" /> : <PlayIcon />}
        {isRunning ? "Running" : "Run"}
      </Button>

      {handle ? (
        <RunFeedback error={error} run={run} />
      ) : (
        <p className="text-xs text-muted-foreground">
          Run the workflow to see its progress here.
        </p>
      )}
    </div>
  )
}

type RunFeedbackProps = {
  error: Error | undefined
  run: ReturnType<typeof useRealtimeRun<typeof helloWorldTask>>["run"]
}

function RunFeedback({ error, run }: RunFeedbackProps) {
  // A subscription error means the client lost the run, not that the run
  // itself failed — the task may well still be executing.
  if (error) {
    return (
      <p className="text-xs text-destructive">
        Lost the connection to this run: {error.message}
      </p>
    )
  }

  if (!run) {
    return (
      <p className="text-xs text-muted-foreground">
        Waiting for the run to start…
      </p>
    )
  }

  const isFinished = FINISHED_STATUSES.has(run.status)
  const isFailure = isFinished && run.status !== "COMPLETED"

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Badge variant={isFailure ? "destructive" : "secondary"}>
          {isFinished ? (
            isFailure ? (
              <XCircleIcon />
            ) : (
              <CheckCircle2Icon />
            )
          ) : (
            <Loader2Icon className="animate-spin" />
          )}
          {run.status}
        </Badge>
        {isFinished ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            {(run.durationMs / 1000).toFixed(1)}s
          </span>
        ) : null}
      </div>

      {run.output ? (
        <p className="text-xs text-muted-foreground">{run.output.message}</p>
      ) : null}

      {run.error ? (
        <p className="text-xs break-words text-destructive">
          {run.error.message}
        </p>
      ) : null}

      <p className="font-mono text-[10px] break-all text-muted-foreground">
        {run.id}
      </p>
    </div>
  )
}

export { RightSidebar }
