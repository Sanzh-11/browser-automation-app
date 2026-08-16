"use client"

import { useTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Loader2Icon, PlusIcon, WorkflowIcon } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import type { Workflow } from "@/lib/db/schema"

import { generateSlug } from "../lib/generate-slug"

type WorkflowNavProps = {
  workflows: Workflow[]
  // The server action is passed down from the server component that renders
  // this nav — it can't be imported here without pulling server code into the
  // client bundle.
  createWorkflowAction: (name: string) => Promise<void>
}

function WorkflowNav({ workflows, createWorkflowAction }: WorkflowNavProps) {
  const { state } = useSidebar()
  const pathname = usePathname()
  const [isCreating, startCreating] = useTransition()

  // The action redirects to the new workflow on success, so there is nothing to
  // do here afterwards — the transition stays pending until the navigation
  // commits.
  const createWorkflow = () => {
    startCreating(async () => {
      await createWorkflowAction(generateSlug())
    })
  }

  // Shared by the collapsed popover and the expanded group, so the active
  // highlight stays in sync between them.
  const workflowMenu = (
    <SidebarMenu>
      {workflows.map((workflow) => {
        const href = `/workflows/${workflow.id}`

        return (
          <SidebarMenuItem key={workflow.id}>
            <SidebarMenuButton asChild isActive={pathname === href}>
              <Link href={href}>
                <span>{workflow.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )

  // Collapsed to the icon rail, the list moves into a popover behind one button.
  if (state === "collapsed") {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton tooltip="Workflows">
                    <WorkflowIcon />
                    <span>Workflows</span>
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent side="right" align="start">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={createWorkflow}
                        disabled={isCreating}
                      >
                        {isCreating ? (
                          <Loader2Icon className="animate-spin" />
                        ) : (
                          <PlusIcon />
                        )}
                        <span>New workflow</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                  <SidebarSeparator />
                  {workflowMenu}
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workflows</SidebarGroupLabel>
      <SidebarGroupAction
        title="New workflow"
        onClick={createWorkflow}
        disabled={isCreating}
      >
        {isCreating ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
        <span className="sr-only">New workflow</span>
      </SidebarGroupAction>
      <SidebarGroupContent>{workflowMenu}</SidebarGroupContent>
    </SidebarGroup>
  )
}

export { WorkflowNav }
