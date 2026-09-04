#!/bin/bash
export PATH="/Users/ayushpuhan/.local/node24/bin:$PATH"
cd "$(dirname "$0")"
exec npm run dev
