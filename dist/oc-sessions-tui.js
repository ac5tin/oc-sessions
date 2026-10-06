// node_modules/@opencode/plugin/dist/tui/plugin.js
function define(plugin) {
  return plugin;
}
// node_modules/solid-js/dist/server.js
var $PROXY = Symbol("solid-proxy");
var $TRACK = Symbol("solid-track");
var $DEVCOMP = Symbol("solid-dev-component");
var ERROR = Symbol("error");
function castError(err) {
  if (err instanceof Error)
    return err;
  return new Error(typeof err === "string" ? err : "Unknown error", {
    cause: err
  });
}
function handleError(err, owner = Owner) {
  const fns = owner && owner.context && owner.context[ERROR];
  const error = castError(err);
  if (!fns)
    throw error;
  try {
    for (const f of fns)
      f(error);
  } catch (e) {
    handleError(e, owner && owner.owner || null);
  }
}
var Owner = null;
function createOwner() {
  const o = {
    owner: Owner,
    context: Owner ? Owner.context : null,
    owned: null,
    cleanups: null
  };
  if (Owner) {
    if (!Owner.owned)
      Owner.owned = [o];
    else
      Owner.owned.push(o);
  }
  return o;
}
function createMemo(fn, value) {
  Owner = createOwner();
  let v;
  try {
    v = fn(value);
  } catch (err) {
    handleError(err);
  } finally {
    Owner = Owner.owner;
  }
  return () => v;
}
function createContext(defaultValue) {
  const id = Symbol("context");
  return {
    id,
    Provider: createProvider(id),
    defaultValue
  };
}
function children(fn) {
  const memo = createMemo(() => resolveChildren(fn()));
  memo.toArray = () => {
    const c = memo();
    return Array.isArray(c) ? c : c != null ? [c] : [];
  };
  return memo;
}
function resolveChildren(children) {
  if (typeof children === "function" && !children.length)
    return resolveChildren(children());
  if (Array.isArray(children)) {
    const results = [];
    for (let i = 0;i < children.length; i++) {
      const result = resolveChildren(children[i]);
      if (Array.isArray(result)) {
        if (result.length < 32768)
          results.push.apply(results, result);
        else
          for (let j = 0;j < result.length; j++)
            results.push(result[j]);
      } else {
        results.push(result);
      }
    }
    return results;
  }
  return children;
}
function createProvider(id) {
  return function provider(props) {
    return createMemo(() => {
      Owner.context = {
        ...Owner.context,
        [id]: props.value
      };
      return children(() => props.children);
    });
  };
}
var SuspenseContext = createContext();

// node_modules/@opencode/plugin/dist/tui/solid.js
var PluginContext = createContext();
// src/tui.ts
var tui_default = define({
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
            const response = await context.client.session.list({ limit: 100, order: "desc" }).catch(() => {
              return;
            });
            const sessions = response?.data ?? [];
            const picked = await context.ui.dialog.select({
              title: "Reference a session",
              options: sessions.map((s) => ({
                title: s.title || s.id,
                value: s.id,
                description: s.location?.directory ?? "",
                category: s.projectID
              })),
              search: (query, options) => options.filter((o) => o.title.toLowerCase().includes(query.toLowerCase()) || o.value.toLowerCase().includes(query.toLowerCase()) || (o.description ?? "").toLowerCase().includes(query.toLowerCase()))
            });
            if (picked)
              context.ui.toast.show({ title: "Session reference", message: `#${picked}`, duration: 8000 });
          }
        }
      ]
    }));
  }
});
export {
  tui_default as default
};
