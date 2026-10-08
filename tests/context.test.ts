import { test, expect } from "bun:test"
import plugin from "../src/index"

type Hook = (event: any) => Promise<void> | void

function fakeContext() {
  const hooks: Record<string, Hook> = {}
  const added: any[] = []
  const ctx = {
    session: {
      hook: async (name: string, handler: Hook) => {
        hooks[name] = handler
      },
      get: async ({ sessionID }: { sessionID: string }) => ({
        title: `title ${sessionID}`,
        location: { directory: "/tmp/project" },
      }),
    },
    tool: {
      transform: async (edit: (editor: { add: (tool: any) => void }) => void) => {
        edit({ add: (tool) => added.push(tool) })
      },
    },
  }
  return { ctx, hooks, added }
}

async function setup() {
  const fake = fakeContext()
  await plugin.setup(fake.ctx as any)
  return fake
}

test("read_session is registered as a direct tool, not Code Mode only", async () => {
  const { added } = await setup()
  const tool = added.find((t) => t.name === "read_session")
  expect(tool.options).toEqual({ codemode: false })
})

test("context keeps read_session and adds a note when the prompt references another session", async () => {
  const { hooks } = await setup()
  await hooks.prompt({ sessionID: "ses_a", prompt: { text: "continue from #ses_b" } })
  const event: any = { sessionID: "ses_a", system: [], tools: { read_session: {}, read: {} } }
  await hooks.context(event)
  expect(event.tools.read_session).toBeDefined()
  expect(event.system[0]?.text).toContain("ses_b")
})

test("context removes read_session when the latest prompt has no session refs", async () => {
  const { hooks } = await setup()
  await hooks.prompt({ sessionID: "ses_a", prompt: { text: "plain prompt" } })
  const event: any = { sessionID: "ses_a", system: [], tools: { read_session: {}, read: {} } }
  await hooks.context(event)
  expect(event.tools.read_session).toBeUndefined()
  expect(event.system).toEqual([])
})
