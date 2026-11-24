# Installation, uninstall, and rollback

This package targets macOS OpenCode Desktop 2.4.1. It is not installed by copying files into OpenCode.app. The active OpenCode installation and its bundled source remain untouched.

## Install from a checkout

1. Download or clone the repository to a stable directory. Install dependencies and verify the build:

   ```sh
   npm ci
   npm run typecheck
   npm run build
   npm test
   ```

2. Back up your own `~/.config/opencode/opencode.jsonc` outside the repository. Do not commit the backup.
3. Add this checkout's absolute directory path as one entry in the global `plugins` array. Preserve every existing plugin, MCP, model, and permission entry. Do not load this copy and an older `network-toggle` copy together.
4. Reopen OpenCode Desktop once. The toggle defaults to off only if `~/.config/opencode-network-toggle/state.json` does not already exist. Subsequent clicks change the stored state without another restart.

Verify the installation in Desktop: confirm the globe pill appears above the composer; click it and check both colors; with a configured web provider, request a web search while red and confirm OpenCode rejects that tool, then repeat while green. Check a local Shell command and any local MCP service you rely on. These checks are required for a new OpenCode version because the GUI API is experimental.

Example snippet (merge into your config; do not replace your whole file):

```jsonc
"plugins": [
  "/absolute/path/to/opencode-web-connect"
]
```

The plugin does not install a search provider. Configure one separately if you want the on state to expose web search. Keep any provider credentials out of this repository.

## Migrate from OpenCode Network Toggle

The source uses the existing plugin ID `network-toggle` and the existing global state file. Replace the old plugin path with the new checkout path in your configuration rather than adding a second entry. Back up the config first. Reopen Desktop, then confirm the GUI pill and your local services before removing the old checkout.

## Uninstall

Remove only this checkout's entry from the `plugins` array and reopen Desktop. Leave unrelated entries unchanged. The state file can be kept for a future reinstall, or deleted manually if you want a later installation to start off. Deleting it is optional.

## Rollback

Restore the exact pre-install plugin entry from your config backup or change only that entry back to the previous checkout path. Reopen Desktop. Do not overwrite a newer config wholesale if it gained other changes after the backup. This repository contains no private config backup.

## Limits

The GUI export is experimental and tied to the tested SDK version. This checkout passed automated policy/build validation and loaded in an isolated OpenCode 2.4.1 server with its GUI bundle active. A Desktop window and web-provider call using this exact checkout remain unverified and must be checked on each target version. Red is not an OS firewall. See [VERIFICATION.md](VERIFICATION.md).
