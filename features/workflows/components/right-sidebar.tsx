"use client"

import { useCallback, useState, useTransition } from "react"
import { unstable_rethrow } from "next/navigation"
import { useReactFlow, useStore, useStoreApi } from "@xyflow/react"
import { Loader2Icon, MoreHorizontal, Play, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ResizablePanel } from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import {
  deleteWorkflowAction,
  runWorkflowAction,
} from "@/features/workflows/actions"
import { validateGraph } from "@/features/workflows/lib/validate-graph"
import {
  nodeRegistry,
  type NodeDefinition,
  type NodeField,
  type NodeType,
  type StepNodeKind,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"

// This file builds up to the RightSidebar component exported at the bottom: a
// header with workflow actions (delete, run), then two tabs — a Toolbar for
// adding nodes and an Editor for tweaking the selected node. Each helper below is
// defined just above the block that uses it.

// ---------------------------------------------------------------------------
// Shared pieces — used by both the Toolbar and the Editor.
// ---------------------------------------------------------------------------

// The accent-colored icon chip, mirroring the node on the canvas.
function NodeIcon({ type, className }: { type: NodeType; className?: string }) {
  const def = nodeRegistry[type]
  const Icon = def.icon
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md",
        def.accent,
        className
      )}
    >
      <Icon className="size-3.5" />
    </span>
  )
}

// A titled, scrollable panel. Each tab renders its content inside one.
function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-y border-border bg-card px-3 py-1.5 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editor tab — edits the fields of the selected node.
// ---------------------------------------------------------------------------

// A single editor field for a node property. Fields marked multiline in the
// registry get a textarea, which grows with its content; the rest get an input.
function Field({
  field,
  value,
  onChange,
}: {
  field: NodeField
  value: string
  onChange: (value: string) => void
}) {
  const props = {
    id: field.key,
    value,
    placeholder: field.placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
  }

  return field.multiline ? <Textarea {...props} /> : <Input {...props} />
}

// The Editor tab: one input per field on the selected node, or an empty state.
function Inspector({ node }: { node: StepNodeType | undefined }) {
  const { updateNodeData } = useReactFlow<StepNodeType>()

  if (!node) {
    return (
      <Section title="Editor">
        <p className="p-3 text-sm text-muted-foreground">No node selected</p>
      </Section>
    )
  }

  const { type, title, values } = node.data
  const def: NodeDefinition = nodeRegistry[type]

  return (
    <Section title={title} icon={<NodeIcon type={type} />}>
      <div className="flex flex-col gap-3 p-3">
        {def.fields.length === 0 ? (
          <p className="text-xs text-muted-foreground">No properties</p>
        ) : (
          def.fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={field.key} className="text-xs">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              <Field
                field={field}
                value={values[field.key] ?? ""}
                onChange={(value) => {
                  updateNodeData(node.id, {
                    values: { ...node.data.values, [field.key]: value },
                  })
                }}
              />
            </div>
          ))
        )}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Toolbar tab — adds nodes to the canvas, grouped by kind.
// ---------------------------------------------------------------------------

// The Toolbar's groups, one accordion section per node kind.
const sections: { kind: StepNodeKind; label: string }[] = [
  { kind: "trigger", label: "Triggers" },
  { kind: "action", label: "Actions" },
]

// Every node type from the registry, filtered into the groups below.
const definitions = Object.values(nodeRegistry)

// A step node's rendered size is driven by its content, but new nodes need a
// size up front to be dropped centered rather than with their corner on the
// center point. These match the min width and the height of StepNode.
const NODE_SIZE = { width: 200, height: 52 }

// Returns the flow position that sits in the middle of the visible canvas. The
// pane lives in another panel, so it is measured through the shared store.
function useViewportCenter() {
  const store = useStoreApi()
  const { screenToFlowPosition } = useReactFlow()

  return useCallback(() => {
    const rect = store.getState().domNode?.getBoundingClientRect()
    if (!rect) {
      return { x: 0, y: 0 }
    }

    const center = screenToFlowPosition({
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    })

    return {
      x: center.x - NODE_SIZE.width / 2,
      y: center.y - NODE_SIZE.height / 2,
    }
  }, [store, screenToFlowPosition])
}

// Titles are numbered per type — "Open URL 1", "Open URL 2" — so several nodes
// of the same type stay tellable apart. Numbering picks up past the highest
// number in use, so deleting a node never hands out a title twice.
function nextTitle(type: NodeType, nodes: StepNodeType[]) {
  const numbers = nodes
    .filter((node) => node.data.type === type)
    .map((node) => Number(/\s(\d+)$/.exec(node.data.title)?.[1] ?? 0))

  return `${nodeRegistry[type].label} ${Math.max(0, ...numbers) + 1}`
}

// The Toolbar tab: a button per node type that adds it to the canvas.
function Palette() {
  const { addNodes, getNodes } = useReactFlow<StepNodeType>()
  const viewportCenter = useViewportCenter()

  const add = (type: NodeType) => {
    const { kind } = nodeRegistry[type]
    const nodes = getNodes()

    // A workflow starts in exactly one place, so a second trigger is refused.
    if (
      kind === "trigger" &&
      nodes.some((node) => node.data.kind === "trigger")
    ) {
      toast.error("A workflow can only have one trigger")
      return
    }

    addNodes({
      id: crypto.randomUUID(),
      type: "step",
      position: viewportCenter(),
      data: { type, kind, title: nextTitle(type, nodes), values: {} },
    })
  }

  return (
    <Section title="Toolbar">
      <Accordion
        type="multiple"
        defaultValue={sections.map((s) => s.kind)}
        className="px-3 py-2"
      >
        {sections.map((section) => (
          <AccordionItem
            key={section.kind}
            value={section.kind}
            className="not-last:border-b-0"
          >
            <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground hover:no-underline">
              {section.label}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-0.5">
              {definitions
                .filter((def) => def.kind === section.kind)
                .map((def) => (
                  <Button
                    key={def.type}
                    variant="ghost"
                    onClick={() => add(def.type as NodeType)}
                    className="justify-start gap-2.5 px-1.5 text-xs"
                  >
                    <NodeIcon type={def.type as NodeType} />
                    {def.label}
                  </Button>
                ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Header — workflow-level actions shown above the tabs.
// ---------------------------------------------------------------------------

// The "..." menu for workflow-level actions.
function ActionsMenu({ workflowId }: { workflowId: string }) {
  const [isDeleting, startDeleting] = useTransition()

  // The action redirects home once the workflow and its Liveblocks room are
  // gone. A redirecting action *rejects* on the client — the router rejects the
  // promise with a NEXT_REDIRECT error instead of resolving it — so that error
  // is the success path and has to go back to the router's RedirectBoundary.
  // `unstable_rethrow` sends it on and leaves only real failures to report.
  const deleteWorkflow = () => {
    startDeleting(async () => {
      try {
        await deleteWorkflowAction(workflowId)
      } catch (error) {
        unstable_rethrow(error)
        toast.error("Could not delete this workflow")
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuItem
          variant="destructive"
          disabled={isDeleting}
          className="text-xs [&_svg:not([class*='size-'])]:size-3.5"
          onSelect={(event) => {
            // Keep the menu open for the round trip, so the disabled item is
            // still on screen while the delete runs.
            event.preventDefault()
            deleteWorkflow()
          }}
        >
          {isDeleting ? <Loader2Icon className="animate-spin" /> : <Trash2 />}
          Delete workflow
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Kicks off a run of the current workflow.
function RunButton({ workflowId }: { workflowId: string }) {
  const { getNodes, getEdges } = useReactFlow<StepNodeType>()
  const [isPending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => {
        const graph = { nodes: getNodes(), edges: getEdges() }
        const problems = validateGraph(graph)

        if (problems.length > 0) {
          toast.error(problems[0])
          return
        }
        startTransition(async () => {
          await runWorkflowAction({ workflowId, graph })
        })
      }}
    >
      <Play fill="primary" />
      Run
    </Button>
  )
}

// ---------------------------------------------------------------------------
// The sidebar itself — header on top, then the Toolbar / Editor tabs.
// ---------------------------------------------------------------------------

export function RightSidebar({ workflowId }: { workflowId: string }) {
  const [tab, setTab] = useState("toolbar")

  const selected = useStore((state) =>
    state.nodes.find((node) => node.selected)
  ) as StepNodeType | undefined

  const [prevSelectedId, setPrevSelectedId] = useState(selected?.id)
  if (selected && selected.id !== prevSelectedId) {
    setPrevSelectedId(selected.id)
    setTab("editor")
  }

  return (
    <ResizablePanel
      className="bg-background"
      defaultSize="16rem"
      minSize="14rem"
      maxSize="36rem"
      groupResizeBehavior="preserve-pixel-size"
    >
      <Tabs value={tab} onValueChange={setTab} className="size-full gap-0">
        <div className="flex items-center justify-between border-b border-border p-2">
          <ActionsMenu workflowId={workflowId} />
          <RunButton workflowId={workflowId} />
        </div>
        <TabsList className="m-2 w-fit bg-background">
          <TabsTrigger
            value="toolbar"
            className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
          >
            Toolbar
          </TabsTrigger>
          <TabsTrigger
            value="editor"
            className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
          >
            Editor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="toolbar" className="flex min-h-0 flex-col">
          <Palette />
        </TabsContent>
        <TabsContent value="editor" className="flex min-h-0 flex-col">
          <Inspector node={selected} />
        </TabsContent>
      </Tabs>
    </ResizablePanel>
  )
}
