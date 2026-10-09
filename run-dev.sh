#!/bin/bash
# Starts the Vite dev server from wherever this repo is checked out.
cd "$(dirname "$0")" || exit 1

# Use node from PATH; launchers that don't inherit your shell PATH (IDE
# previews, GUI apps) fall back to the usual install locations.
NODE="$(command -v node || ls -d "$HOME"/.local/node*/bin/node "$HOME"/.nvm/versions/node/*/bin/node /opt/homebrew/bin/node /usr/local/bin/node 2>/dev/null | tail -1)"
if [ -z "$NODE" ] || [ ! -x "$NODE" ]; then
  echo "run-dev.sh: could not find node. Install Node 20+ or add it to your PATH." >&2
  exit 127
fi

exec "$NODE" node_modules/.bin/vite --port 3092 --host
