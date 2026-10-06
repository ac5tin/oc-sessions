import { Plugin } from "@opencode/plugin/tui"

export default Plugin.define({
  id: "oc-sessions",
  setup(context) {
    context.keymap.layer(() => ({
      mode: "global",
      commands: [
        {
          id: "oc-sessions.ref",
          title: "Copy a #session reference token",
          group: "oc-sessions",
          palette: true,
          slash: { name: "session-ref", aliases: ["ref"] },
          run: async () => {
            const response = await context.client.session.list({ limit: 100, order: "desc" }).catch(() => undefined)
            const sessions = response?.data ?? []
            const picked = await context.ui.dialog.select({
              title: "Reference a session (Enter copies #token)",
              options: sessions.map((s) => {
                const dir = s.location?.directory ?? ""
                const repo = dir.split("/").filter(Boolean).pop() ?? dir
                return {
                  title: s.title || s.id,
                  value: s.id,
                  // description keeps the full title + repo path because the
                  // dialog truncates the title line; users search by repo too
                  description: `${repo} — ${context.ui.format.path(dir)}${s.title ? ` — ${s.title}` : ""}`,
                  category: repo || s.projectID,
                }
              }),
              search: (query, options) => {
                const q = query.toLowerCase()
                return options.filter(
                  (o) =>
                    o.title.toLowerCase().includes(q) ||
                    o.value.toLowerCase().includes(q) ||
                    (o.description ?? "").toLowerCase().includes(q),
                )
              },
            })
            if (picked) {
              const token = `#${picked}`
              const copied = context.renderer.copyToClipboardOSC52(token)
              context.ui.toast.show({
                title: copied ? "Copied to clipboard" : "Paste into your prompt",
                message: token,
                duration: 8000,
              })
            }
          },
        },
        {
          id: "oc-sessions.id",
          title: "Show current session ID",
          group: "oc-sessions",
          palette: true,
          slash: { name: "session-id" },
          run: () => {
            const route = context.ui.router.current()
            const sessionID = route?.type === "session" ? route.sessionID : undefined
            if (sessionID) {
              context.renderer.copyToClipboardOSC52(sessionID)
              context.ui.toast.show({ title: "Current session ID (copied)", message: sessionID, duration: 8000 })
            } else {
              context.ui.toast.show({ message: "No active session", variant: "warning" })
            }
          },
        },
      ],
    }))

    context.ui.slot({
      append: "prompt.footer.status",
      render: (input) => {
        const sessionID = input.sessionID
        if (!sessionID) return null
        return <text fg={context.theme.text.muted}>{sessionID}</text>
      },
    })
  },
})
