import { Schema } from "effect"
import { ComposerPill, Ipc, Plugin } from "@opencode/plugin/gui"
import type { ComposerPillView } from "@opencode/plugin/gui"
import { readEnabled, writeEnabled } from "./state.js"

const Toggle = Ipc.define({
  id: "network-toggle.state",
  state: Schema.Struct({ enabled: Schema.Boolean }),
  methods: { toggle: { output: Schema.Boolean } },
})

export default Plugin.define({
  os: ["macos"],
  i18n: {
    en: { "on": "Online search on", "off": "Online search off" },
    zh: { "on": "联网搜索已开启", "off": "联网搜索已关闭" },
  },
  setup(ctx) {
    const toggle = ctx.main(Toggle)
    ctx.add(ComposerPill, {
      id: "network-search",
      show: (): ComposerPillView => {
        const enabled = toggle.state()?.enabled ?? false
        return {
          icon: "globe",
          label: enabled ? ctx.t("on") : ctx.t("off"),
          title: enabled ? ctx.t("on") : ctx.t("off"),
          tone: enabled ? "success" : "danger",
          run: () => void toggle.toggle({ signal: ctx.signal }).catch((error) => console.error("Network Toggle", error)),
        }
      },
    })
  },
  main(ctx) {
    const provider = ctx.provide(Toggle, {
      state: () => ({ enabled: readEnabled() }),
      toggle: () => {
        const enabled = !readEnabled()
        writeEnabled(enabled)
        provider.changed()
        return enabled
      },
    })
  },
})
