"use client"

import { useCallback, useSyncExternalStore } from "react"
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type ColorMode,
  type Edge,
  type Node,
  type OnConnect,
  ConnectionLineType,
} from "@xyflow/react"
import { useTheme } from "next-themes"

const initialNodes: Node[] = [
  {
    id: "n1",
    type: "input",
    position: { x: 0, y: 0 },
    data: { label: "Start" },
  },
  { id: "n2", position: { x: 0, y: 120 }, data: { label: "Open URL" } },
  {
    id: "n3",
    type: "output",
    position: { x: 0, y: 240 },
    data: { label: "Extract" },
  },
]

const initialEdges: Edge[] = [
  { id: "n1-n2", source: "n1", target: "n2" },
  { id: "n2-n3", source: "n2", target: "n3" },
]

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
