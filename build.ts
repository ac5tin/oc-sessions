import { createSolidTransformPlugin } from "@opentui/solid/bun-plugin"

// server plugin: no JSX, no solid
await Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: ".opencode/plugins",
  naming: "oc-sessions.js",
  target: "node",
  format: "esm",
})

// TUI plugin: JSX via @opentui/solid transform; bare specifiers are rewritten
// by opencode to its own running instances, so we must NOT inline solid.
await Bun.build({
  entrypoints: ["src/tui.tsx"],
  outdir: "dist",
  naming: "oc-sessions-tui.js",
  target: "bun",
  format: "esm",
  external: ["@opencode/*", "@opentui/*", "solid-js", "solid-js/*"],
  plugins: [createSolidTransformPlugin()],
})

console.log("Build complete")
