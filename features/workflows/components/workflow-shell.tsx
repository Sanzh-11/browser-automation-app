import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { runWorkflowAction } from "../actions"
import { RightSidebar } from "./right-sidebar"

type WorkflowShellProps = {
  workflowId: string
}

// Every size here is a rem string, not a percentage — the editor's panels are
// sized against their content (a canvas, a log tail, an inspector form), so they
// should hold their width as the window resizes instead of scaling with it.
function WorkflowShell({ workflowId }: WorkflowShellProps) {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="size-full"
      data-workflow-id={workflowId}
    >
      <ResizablePanel minSize="30rem">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel minSize="18rem">
            <div className="flex size-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Canvas</p>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="8rem" minSize="6rem">
            <div className="flex size-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Logs</p>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="16rem" minSize="14rem" maxSize="36rem">
        <RightSidebar
          workflowId={workflowId}
          runWorkflowAction={runWorkflowAction}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export { WorkflowShell }
