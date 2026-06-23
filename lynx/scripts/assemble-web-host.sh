#!/usr/bin/env bash
# Build the ReactLynx app for the web target and assemble a static host that
# renders the produced `main.web.bundle` inside <lynx-view> using the
# pre-bundled @lynx-js/web-core client. Output: ./web-host (served on :8137).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "› building web bundle (rspeedy, environment=web)…"
npm run build >/dev/null

echo "› assembling web-host/…"
rm -rf web-host/static web-host/main.web.bundle
cp -r node_modules/@lynx-js/web-core/dist/client_prod/static web-host/static
cp dist/main.web.bundle web-host/main.web.bundle

echo "› serving on http://localhost:8137  (Ctrl-C to stop)"
node scripts/static-server.cjs web-host 8137
