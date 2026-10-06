import { Plugin } from "@opencode/plugin/tui"

export default Plugin.define({
  id: "oc-sessions",
  setup(context) {
    context.keymap.layer(() => ({
      mode: "global",
      commands: [
        {
          id: "oc-sessions.ref",
          title: "Get a #session reference token",
          group: "oc-sessions",
          palette: true,
          slash: { name: "session-ref", aliases: ["ref"] },
          run: async () => {
            const response = await context.client.session.list({ limit: 100, order: "desc" }).catch(() => undefined)
            const sessions = response?.data ?? []
            const picked = await context.ui.dialog.select({
              title: "Reference a session",
              options: sessions.map((s) => ({
                title: s.title || s.id,
                value: s.id,
                description: s.location?.directory ?? "",
                category: s.projectID,
              })),
              search: (query, options) =>
                options.filter(
                  (o) =>
                    o.title.toLowerCase().includes(query.toLowerCase()) ||
                    o.value.toLowerCase().includes(query.toLowerCase()) ||
                    (o.description ?? "").toLowerCase().includes(query.toLowerCase()),
                ),
            })
            if (picked) context.ui.toast.show({ title: "Session reference", message: `#${picked}`, duration: 8000 })
          },
        },
      ],
    }))
  },
})
