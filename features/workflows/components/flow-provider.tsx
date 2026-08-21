"use client"

import type { ReactNode } from "react"
import { ReactFlowProvider } from "@xyflow/react"

// The canvas and the sidebar's toolbar live in separate panels, so the React Flow
// store has to sit above both of them rather than inside <ReactFlow />.
export function FlowProvider({ children }: { children: ReactNode }) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>
}
