import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"

export const statePath = join(homedir(), ".config", "opencode-network-toggle", "state.json")

export function readEnabled(file = statePath): boolean {
  try {
    const value: unknown = JSON.parse(readFileSync(file, "utf8"))
    return typeof value === "object" && value !== null && "enabled" in value && value.enabled === true
  } catch {
    return false
  }
}

export function writeEnabled(enabled: boolean, file = statePath): void {
  const directory = dirname(file)
  mkdirSync(directory, { recursive: true, mode: 0o700 })
  const temporary = join(directory, `.state-${process.pid}-${Date.now()}.tmp`)
  writeFileSync(temporary, JSON.stringify({ enabled }) + "\n", { mode: 0o600 })
  renameSync(temporary, file)
}
