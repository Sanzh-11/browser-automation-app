import toposort from "toposort"
import type { WorkflowGraph } from "@/lib/db/schema"

export function validateGraph({ nodes, edges }: WorkflowGraph): string[] {
  const problems: string[] = []
  const triggers = nodes.filter((n) => n.data.kind === "trigger").length

  if (triggers !== 1) {
    problems.push(
      `A workflow must have exactly one Start trigger (found ${triggers})`
    )
  }

  if (edges.length === 0) {
    problems.push("Connect your nodes before running the workflow")
  } else {
    try {
      toposort(edges.map((e) => [e.source, e.target]))
    } catch (err) {
      problems.push(
        "The workflow contains a cycle - remove the loop before running"
      )
    }
  }

  return problems
}
