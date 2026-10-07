#!/bin/bash
# Starts the Vite dev server from wherever this repo is checked out.
cd "$(dirname "$0")" || exit 1
exec node node_modules/.bin/vite --port 3092 --host
