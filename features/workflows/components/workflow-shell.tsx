import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { runWorkflowAction } from "../actions"
import { Canvas } from "./canvas"
import { RightSidebar } from "./right-sidebar"

type WorkflowShellProps = {
  workflowId: string
}

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
            <Canvas />
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
