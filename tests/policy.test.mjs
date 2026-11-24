import assert from "node:assert/strict"
import test from "node:test"
import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

const root = new URL("../src/", import.meta.url)
// The implementation uses TypeScript with syntax valid in Node's strip-types mode.
const { blockReason, offlineBlockReason, shellBlockReason } = await import(new URL("policy.ts", root))
const { readEnabled, writeEnabled } = await import(new URL("state.ts", root))

test("internet search and browser tools are denied offline", () => {
  for (const name of ["websearch", "webfetch", "firecrawl_search", "mcp_firecrawl_crawl", "browser.navigate"]) {
    assert.equal(typeof blockReason(name, {}), "string", name)
  }
})

test("local Shell remains available without plugin approval", () => {
  for (const name of ["shell", "bash", "execute", "terminal", "pty", "python", "node"]) {
    assert.equal(blockReason(name, { command: "pwd" }), undefined, name)
  }
  for (const command of ["ls -lh /tmp", "python3 local.py", "curl http://127.0.0.1:11434/api/tags", "curl http://[::1]:11434/api/tags"]) {
    assert.equal(shellBlockReason(command), undefined, command)
  }
})

test("visible browser launches and external Shell requests are blocked", () => {
  for (const command of [
    "open -a Safari https://wx.qq.com",
    "/usr/bin/open -a 'Google Chrome'",
    "osascript -e 'tell application \"Safari\" to activate'",
    "osascript -e 'open location \"https://wx.qq.com\"'",
    "curl https://example.org",
    "wget example.org",
  ]) {
    assert.equal(typeof shellBlockReason(command), "string", command)
    assert.equal(typeof blockReason("shell", { command }), "string", command)
  }
})

test("local services remain available; explicit OCU navigation is denied", () => {
  for (const name of ["anythingllm_rag_search", "opencode_mem_search", "ocu_click", "read", "write"]) {
    assert.equal(blockReason(name, { target: "local app" }), undefined, name)
  }
  assert.equal(typeof blockReason("ocu_open", { url: "https://example.org" }), "string")
  assert.equal(typeof blockReason("ocu_action", { action: "open browser" }), "string")
})

test("same tool changes from denied to allowed when switch turns ON", () => {
  assert.equal(typeof offlineBlockReason("websearch", { query: "test" }, false), "string")
  assert.equal(offlineBlockReason("websearch", { query: "test" }, true), undefined)
  assert.equal(offlineBlockReason("anythingllm_rag_search", { query: "local" }, false), undefined)
})

test("state is global file, defaults OFF, survives rewrite, fails closed", async () => {
  const dir = await mkdtemp(join(tmpdir(), "network-toggle-test-"))
  const file = join(dir, "state.json")
  assert.equal(readEnabled(file), false)
  writeEnabled(true, file)
  assert.equal(readEnabled(file), true)
  writeEnabled(false, file)
  assert.equal(readEnabled(file), false)
  await writeFile(file, "invalid")
  assert.equal(readEnabled(file), false)
})
