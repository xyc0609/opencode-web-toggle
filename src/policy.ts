// This policy controls OpenCode tool calls, not network access by arbitrary
// processes or computer-use clicks. It does not add Shell permissions.
export function blockReason(tool: string, input: unknown): string | undefined {
  const id = tool.toLowerCase().replace(/[^a-z0-9]+/g, "_")

  if (/(^|_)(websearch|web_search|webfetch|web_fetch|firecrawl|browser|playwright|puppeteer|chrome|fetch_url|open_url)(_|$)/.test(id)) {
    return "Internet search or browser tool is disabled"
  }

  if (/(^|_)(bash|shell|execute|terminal|pty|python|node|code_run)(_|$)/.test(id) && typeof input === "object" && input !== null) {
    for (const key of ["command", "code", "script"]) {
      const value = (input as Record<string, unknown>)[key]
      if (typeof value === "string") {
        const reason = shellBlockReason(value)
        if (reason) return reason
      }
    }
  }

  // OCU is a general computer-use interface. Preserve local app operation,
  // but reject overt browser navigation requests where their intent is visible.
  if (/(^|_)(ocu|computer_use)(_|$)/.test(id)) {
    let serialized: string
    try { serialized = JSON.stringify(input ?? {}).toLowerCase() }
    catch { return "Computer-use input could not be inspected" }
    if (/https?:\/\/|\b(browser|chrome|safari|firefox|edge|navigate|open_url|web_search)\b/.test(serialized)) {
      return "Browser navigation through computer use is disabled"
    }
  }

  return undefined
}

// Covers obvious browser launches and network clients in visible command text.
// This is defense in depth, not a parser, network firewall, or completeness claim.
export function shellBlockReason(command: string): string | undefined {
  const launch = /(?:^|[;&|\n(]\s*|\s)(?:\/usr\/bin\/)?(?:open|osascript)\b/i.test(command)
  const browser = /\b(?:safari|google\s+chrome|chromium|firefox|microsoft\s+edge|brave)\b/i.test(command)
  if (launch && browser) return "Opening a browser through Shell is disabled"
  if (/\b(?:webbrowser\.open|open\s+location)\b/i.test(command)) return "Browser navigation through Shell is disabled"

  const urls = command.match(/(?:https?|ftp):\/\/[^\s"'<>]+/gi) ?? []
  for (const raw of urls) {
    try {
      const hostname = new URL(raw).hostname.toLowerCase()
      if (hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "[::1]") {
        return "External URL in Shell command is disabled"
      }
    } catch {
      return "Unparseable URL in Shell command is disabled"
    }
  }

  const networkClient = /(?:^|[;&|\n(]\s*)(?:\/[^\s]+\/)?(?:curl|wget|ftp|aria2c)\b/i.test(command)
  if (networkClient && urls.length === 0 && !/\b(?:localhost|127\.0\.0\.1|::1)\b/i.test(command)) {
    return "Unverified Shell network client is disabled"
  }
  return undefined
}

export function offlineBlockReason(tool: string, input: unknown, enabled: boolean): string | undefined {
  return enabled ? undefined : blockReason(tool, input)
}
