import Link from "next/link"
import { ArrowLeftIcon, SearchXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function NotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>Workflow not found</EmptyTitle>
        <EmptyDescription>
          This workflow doesn&apos;t exist, or it belongs to an organization
          you&apos;re not a member of.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeftIcon data-icon="inline-start" />
            Back to workflows
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
