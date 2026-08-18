"use client"

import { useSyncExternalStore } from "react"
import {
  Controls,
  ReactFlow,
  type ColorMode,
  type Edge,
  ConnectionLineType,
  NodeTypes,
} from "@xyflow/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import { useTheme } from "next-themes"
import { StepNode } from "./step-node"
import type { StepNodeType } from "@/features/workflows/nodes/node-registry"

import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"

const nodeTypes: NodeTypes = {
  step: StepNode,
}

const initialNodes: StepNodeType[] = [
  {
    id: "start",
    type: "step",
    position: { x: 0, y: 0 },
    data: {
      type: "start",
      kind: "trigger",
      title: "Start",
      values: {},
    },
  },
]

const initialEdges: Edge[] = []

function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<StepNodeType, Edge>({
      suspense: true,
      nodes: { initial: initialNodes },
      edges: { initial: initialEdges },
    })

  const colorMode = useColorMode()

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDelete={onDelete}
      colorMode={colorMode}
      fitView
      connectionLineType={ConnectionLineType.SmoothStep}
      connectionLineStyle={{ stroke: "var(--border)" }}
      defaultEdgeOptions={{
        type: "smoothstep",
        style: { stroke: "var(--border)" },
      }}
      style={
        {
          "--xy-background-color": "var(--background)",
          "--xy-edge-stroke-width:": "2",
          "--xy-connectionline-stroke-width": "2",
        } as React.CSSProperties
      }
      maxZoom={1}
    >
      <Controls />
      <Cursors />
    </ReactFlow>
  )
}

function useColorMode(): ColorMode {
  const { resolvedTheme } = useTheme()
  const isHydrated = useSyncExternalStore(subscribe, onClient, onServer)

  return isHydrated && resolvedTheme === "dark" ? "dark" : "light"
}

const subscribe = () => () => {}
const onClient = () => true
const onServer = () => false

export { Canvas }
