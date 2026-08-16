import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="flex min-h-0 w-full flex-1 items-center justify-center p-6">
      <Spinner className="size-5 text-muted-foreground" />
    </div>
  )
}
