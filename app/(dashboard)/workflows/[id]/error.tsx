"use client" // Error boundaries must be Client Components

import { useEffect } from "react"
import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>Couldn&apos;t load this workflow</EmptyTitle>
        <EmptyDescription>
          Something went wrong on our end. Try again — if it keeps happening,
          pick another workflow from the sidebar.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {/* Re-fetches and re-renders this segment rather than only clearing the
            error state, so a transient failure can actually recover. */}
        <Button onClick={() => unstable_retry()}>
          <RotateCcwIcon data-icon="inline-start" />
          Try again
        </Button>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground">
            {error.digest}
          </p>
        ) : null}
      </EmptyContent>
    </Empty>
  )
}
