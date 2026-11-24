import { Plugin } from "@opencode/plugin"
import { Error as ToolError } from "@opencode/plugin/promise/tool"
import { blockReason, offlineBlockReason, shellBlockReason } from "./policy.js"
import { readEnabled } from "./state.js"

export default Plugin.define({
  id: "network-toggle",
  async setup(ctx) {
    await ctx.tool.hook("execute.before", (event) => {
      const reason = offlineBlockReason(event.tool, event.input, readEnabled())
      if (reason) throw new ToolError({ message: `Network Toggle: ${reason}` })
    })

    await ctx.shell.hook("create.before", (event) => {
      if (readEnabled()) return
      const reason = shellBlockReason(event.command)
      if (reason) throw new ToolError({ message: `Network Toggle: ${reason}` })
    })

    await ctx.session.hook("context", (event) => {
      if (readEnabled()) return
      for (const id of Object.keys(event.tools)) {
        if (blockReason(id, undefined)) delete event.tools[id]
      }
      event.system.push({
        type: "text",
        text: "Internet search is disabled by Network Toggle. Web search and browser tools are blocked. Local Shell and code execution remain available under existing permissions. Do not launch browsers or make external network requests through Shell or computer use. Visible Shell browser launches and external URLs are blocked, but this is not process-level network isolation.",
      })
    })
  },
})
