#!/usr/bin/env bash
# Launch the Understand Anything dashboard for EraBall's knowledge graph.
# Prints a tokenized URL; runs in the foreground (Ctrl+C to stop).
#
# Requires the Understand-Anything plugin checked out (default path below) and its
# workspace deps installed (`pnpm install` in that repo, then core built once).
set -euo pipefail
export PATH="/opt/homebrew/bin:$(npm config get prefix 2>/dev/null)/bin:$PATH"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
UA="${UNDERSTAND_ANYTHING_ROOT:-$HOME/Documents/GitHub/Understand-Anything}"
DASH="$UA/understand-anything-plugin/packages/dashboard"

[ -f "$REPO/.understand-anything/knowledge-graph.json" ] || { echo "No knowledge graph. Run: bash docs/refresh.sh"; exit 1; }
[ -d "$DASH" ] || { echo "Understand-Anything plugin not found at $UA (set UNDERSTAND_ANYTHING_ROOT)"; exit 1; }

( cd "$UA" && pnpm --filter @understand-anything/core build >/dev/null 2>&1 || true )
cd "$DASH"
GRAPH_DIR="$REPO" npx vite --host 127.0.0.1
