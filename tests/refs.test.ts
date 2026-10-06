import { test, expect } from "bun:test"
import { extractRefs, compressMessages } from "../src/index"

test("extracts unique refs in order, dedupes repeats", () => {
  expect(extractRefs("auth done in #ses_A1 , now payment using #ses_A1 and #ses_B2")).toEqual(["ses_A1", "ses_B2"])
})

test("ignores non-session fragments", () => {
  expect(extractRefs("see @src/auth.ts#20-45 and #20")).toEqual([])
})

test("compress flattens user/assistant, truncates", () => {
  const msgs = [
    { type: "user", text: "hi" },
    { type: "assistant", content: [{ type: "text", text: "hello" }, { type: "tool", tool: "read" }] },
    { type: "compaction" },
  ]
  const out = compressMessages(msgs)
  expect(out).toContain("## user\nhi")
  expect(out).toContain("## assistant\nhello")
  expect(out).toContain("[tool: read]")
})
