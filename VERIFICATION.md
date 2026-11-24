# Verification and provenance

## Source provenance

This repository is a packaging copy of the existing `OpenCode Network Toggle` version 0.2.2 from the current `version2` development conversation. Its four `src/` files, two tests, GUI build output, and Vite/TypeScript configuration were copied without implementation edits. Only package metadata and public documentation were changed. The source file hashes were compared immediately after copying.

File timestamps place this implementation on **2026-11-24**. We did not find evidence that this exact implementation existed on 2026-11-23, so the public documentation does not claim that date.

## What has been verified

| Check | Result |
| --- | --- |
| Desktop version inspection | Local OpenCode Desktop reported 2.4.1 during development. |
| Source copy | `src/` hashes matched the original project immediately after copying. |
| Clean dependency install | `npm ci` completed successfully in this separate checkout without touching the active plugin directory. A second `npm ci --offline` succeeded from the local cache. |
| Local toolchain | Node.js 26.13.1 and npm 11.20.0 were used for the clean install and tests. Other Node versions were not exercised. |
| `npm test` | 7 policy and hook simulations passed in this checkout. |
| `npm run typecheck` and `npm run build` | Both passed in this checkout; GUI bundle hash matches the original project. |
| Isolated OpenCode server load | On 2026-11-24, the bundled OpenCode 2.4.1 CLI started with a temporary XDG configuration pointing only to this Desktop checkout. `/api/plugin` reported `network-toggle` as `active`, with `source.type=local`, `source.path` pointing to this checkout, and both `server` and `gui` features enabled. `/api/plugin/gui?id=network-toggle` returned HTTP 200 and a GUI bundle. The temporary service was stopped after the check. |
| Repeat validation after isolated load | `npm test` passed 7/7; `npm run typecheck` and `npm run build` passed. |
| Existing installation | The active `~/.config/opencode/opencode.jsonc` still points to the original plugin directory. This checkout was loaded only by the temporary server. |
| Package dry run | `npm pack --dry-run` succeeded with the public files; four screenshots were included. Private work and backups were excluded. |
| GUI evidence | User-provided Desktop screenshots show both red and green globe pills above the composer. They do not identify the loaded plugin build. |
| Off-state evidence | A user-provided screenshot shows a web-search tool reporting that search was disabled while the pill was red. |
| On-state evidence | A user-provided screenshot shows `Parallel Web Search` invoked while the pill was green, followed by a model answer. The underlying provider response and answer accuracy were not independently inspected. |
| Dependency audit | `npm audit --omit=dev` reported 24 moderate advisories in the locked dependency tree, including transitive packages. Dependencies were not upgraded during this source-preserving packaging task. |

## Not verified yet

- Visual inspection and button clicks in an isolated OpenCode Desktop window using this checkout. The isolated server API proved plugin and GUI bundle activation, but not Desktop rendering or a model conversation using this exact checkout.
- Independent verification of the web provider response and answer accuracy in the pictured Ollama conversation.
- Complete prevention of external network access through Shell, OCU, unknown tools, or other apps. The plugin does not provide this guarantee.
- Compatibility beyond macOS OpenCode Desktop 2.4.1.

The existing active OpenCode installation was not reconfigured to test this publishing copy. Automated tests use a temporary HOME/state file, and the isolated server check did not change the user's global toggle state. The package cannot honestly be described as fully end-to-end verified until an isolated Desktop conversation or a safe migration is completed.
