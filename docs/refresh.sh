#!/usr/bin/env bash
# Regenerate all EraBall dev docs (AST-only, no API key / no cost):
#   docs/code-graph/ios/graph.html   — graphify structural graph of the iOS app
#   docs/code-graph/web/graph.html   — graphify structural graph of the web app
#   .understand-anything/knowledge-graph.json — curated Understand-Anything knowledge graph
#
# Usage:  bash docs/refresh.sh
set -euo pipefail
shopt -s dotglob   # move dotfiles (.graphify_*) too
export PATH="/opt/homebrew/bin:$(npm config get prefix 2>/dev/null)/bin:$PATH"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
CG="$REPO/docs/code-graph"

echo "→ iOS structural graph"
( cd "$REPO/ios/EraBall" \
    && uvx --from graphifyy graphify . --no-label >/dev/null 2>&1 \
    && uvx --from graphifyy graphify cluster-only . --no-label >/dev/null 2>&1 )
rm -rf "$CG/ios"; mkdir -p "$CG/ios"
mv "$REPO/ios/EraBall/graphify-out/"* "$CG/ios/" 2>/dev/null || true
rm -rf "$REPO/ios/EraBall/graphify-out"

echo "→ web structural graph"
STAGE="$(mktemp -d)/web-code"; mkdir -p "$STAGE"
( cd "$REPO" && rsync -aR --include='*/' --include='*.ts' --include='*.tsx' --exclude='*' app packages src lib services "$STAGE/" 2>/dev/null )
( cd "$STAGE" \
    && uvx --from graphifyy graphify . --no-label >/dev/null 2>&1 \
    && uvx --from graphifyy graphify cluster-only . --no-label >/dev/null 2>&1 )
rm -rf "$CG/web"; mkdir -p "$CG/web"
mv "$STAGE/graphify-out/"* "$CG/web/" 2>/dev/null || true
rm -rf "$(dirname "$STAGE")"

echo "→ curated knowledge graph"
node "$REPO/docs/knowledge-graph/generate.mjs"

echo
echo "dev docs refreshed:"
echo "  code graph (iOS):  $CG/ios/graph.html"
echo "  code graph (web):  $CG/web/graph.html"
echo "  knowledge graph:   $REPO/.understand-anything/knowledge-graph.json"
echo "  open dashboard:    bash docs/dashboard.sh"
