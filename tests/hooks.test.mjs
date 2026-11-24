import assert from "node:assert/strict"
import test from "node:test"
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const home = mkdtempSync(join(tmpdir(), "network-toggle-hooks-"))
process.env.HOME = home
const stateFile = join(home, ".config", "opencode-network-toggle", "state.json")
const plugin = (await import("../work/server-plugin-test.mjs")).default

function setEnabled(enabled) {
  mkdirSync(join(home, ".config", "opencode-network-toggle"), { recursive: true })
  writeFileSync(stateFile, JSON.stringify({ enabled }))
}

test("server hooks keep local shell, stop visible browser launches, and toggle web tools", async () => {
  let before, context, createShell
  await plugin.setup({
    tool: { hook: async (name, callback) => { assert.equal(name, "execute.before"); before = callback } },
    shell: { hook: async (name, callback) => { assert.equal(name, "create.before"); createShell = callback } },
    session: { hook: async (name, callback) => { assert.equal(name, "context"); context = callback } },
    permission: {
      hook: () => { throw Error("plugin must not register a permission hook") },
      assert: () => { throw Error("plugin must not request shell approval") },
    },
  })

  const shell = { tool: "shell", input: { command: "pwd" }, sessionID: "s", agent: "build", messageID: "m", id: "c" }
  const tools = { shell: {}, websearch: {}, webfetch: {}, firecrawl_search: {}, read: {} }
  setEnabled(false)
  await context({ tools, system: [] })
  assert.deepEqual(Object.keys(tools), ["shell", "read"])
  await before(shell)
  await before({ ...shell, input: { command: "python3 local.py" } })
  createShell({ command: "pwd" })
  createShell({ command: "curl http://127.0.0.1:11434/api/tags" })
  assert.throws(() => before({ ...shell, input: { command: "open -a Safari https://wx.qq.com" } }))
  assert.throws(() => createShell({ command: "open -a Safari https://wx.qq.com" }))
  assert.throws(() => createShell({ command: "curl https://example.org" }))
  assert.throws(() => before({ ...shell, tool: "websearch" }))

  setEnabled(true)
  await before(shell)
  await before({ ...shell, tool: "websearch" })
  createShell({ command: "open -a Safari https://wx.qq.com" })
})
