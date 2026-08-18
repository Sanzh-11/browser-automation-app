"use client"

import { useCallback, useSyncExternalStore } from "react"
import {
  addEdge,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type ColorMode,
  type Edge,
  type OnConnect,
  ConnectionLineType,
  NodeTypes,
} from "@xyflow/react"
import { useTheme } from "next-themes"
import { StepNode } from "./step-node"
import type { StepNodeType } from "@/features/workflows/nodes/node-registry"

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
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const colorMode = useColorMode()

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((current) => addEdge(connection, current)),
    [setEdges]
  )

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
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
