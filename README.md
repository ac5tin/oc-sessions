# oc-sessions

Reference other OpenCode chat sessions inline with `#ses_...` — works across
projects/directories — and let the model read the referenced session on demand.

## Install

Add to `~/.config/opencode/opencode.json` (or your project's `opencode.json`):

```jsonc
{
  "plugins": [
    "oc-sessions@git+https://github.com/ac5tin/oc-sessions.git"
  ]
}
```

Restart OpenCode (`opencode service restart`) after changing the plugin list.

## Usage

Reference one or more sessions in any prompt:

```text
auth is completed in #ses_abc123, now do payment that works with #ses_abc123
```

- The same session mentioned twice is reported once (deduped, in mention order).
- Each reference is surfaced to the model as a short system note; the model can
  call the `read_session` tool with the exact session ID to fetch a compressed
  transcript of that session.
- Retrieval is lazy by default — only metadata goes into context unless the
  model asks for the transcript.

Get a session ID to reference: run `/session-ref` (or find it in
`opencode api get /api/session` output) and pick from the cross-project session
list. The exact `#...` token is shown in a toast to paste into your prompt.

## How it works

- `prompt` hook parses `#ses_...` tokens from your input (1–5 unique refs).
- `context` hook appends a small note listing the referenced sessions
  (title/directory when available). It does not copy the transcripts into
  context.
- `read_session` tool fetches the referenced session's messages, flattens them
  into a capped, readable transcript (~8k chars), and returns it.

## Development

```bash
bun install
bun test
bun run bundle   # rebuild .opencode/plugins/oc-sessions.js + dist/oc-sessions-tui.js
```

Note: this project targets OpenCode V2. V1 plugins (`@opencode-ai/plugin`)
will not run on OpenCode 2.x.
