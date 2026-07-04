#!/usr/bin/env bash
# Refresh the graphify knowledge graphs for both the web app and the iOS app so the
# web<->iOS parity comparison stays live. AST-only (no API key / no cost).
#   iOS graph -> ios/EraBall/graphify-out/graph.html
#   web graph -> ios/graphify-web/graph.html   (staged from app/packages/src/lib/services *.ts[x])
set -euo pipefail
export PATH="/opt/homebrew/bin:$PATH"
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
STAGE="$(mktemp -d)/web-code"
mkdir -p "$STAGE"
cd "$REPO"
# Stage only TS/TSX so no doc/css file forces semantic (LLM) extraction.
rsync -aR --include='*/' --include='*.ts' --include='*.tsx' --exclude='*' app packages src lib services "$STAGE/" 2>/dev/null
( cd "$STAGE" && uvx --from graphifyy graphify . --no-label >/dev/null 2>&1 )
cp -R "$STAGE/graphify-out/." "$REPO/ios/graphify-web/"
# iOS side (Swift app source).
( cd "$REPO/ios/EraBall" && uvx --from graphifyy graphify . --no-label >/dev/null 2>&1 )
echo "graphs refreshed:"
echo "  web: $REPO/ios/graphify-web/graph.html"
echo "  ios: $REPO/ios/EraBall/graphify-out/graph.html"
