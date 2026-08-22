import { defineConfig } from "@trigger.dev/sdk"

export default defineConfig({
  project: "proj_mnfxxuvcrjzlnournxhj",
  runtime: "node",
  logLevel: "log",
  // Tasks are killed after this many seconds. Individual tasks can override it.
  maxDuration: 300,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["features/workflows/tasks"],
  build: {
    // Stagehand spawns a crash-cleanup supervisor from a CLI entrypoint that
    // sits next to its own dist files, so it has to stay in node_modules.
    external: ["@browserbasehq/stagehand"],
  },
})
