#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROFILE="${1:-preview}"

cd "$ROOT_DIR"
mkdir -p apk

BUILD_JSON="$(npx eas-cli@latest build -p android -e "$PROFILE" --wait --json)"

BUILD_ID="$(printf '%s' "$BUILD_JSON" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); const build = Array.isArray(data) ? data[0] : data; if (!build?.id) process.exit(1); process.stdout.write(build.id);")"
BUILD_STATUS="$(printf '%s' "$BUILD_JSON" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); const build = Array.isArray(data) ? data[0] : data; if (!build?.status) process.exit(1); process.stdout.write(build.status);")"
ARTIFACT_URL="$(printf '%s' "$BUILD_JSON" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); const build = Array.isArray(data) ? data[0] : data; const url = build?.artifacts?.buildUrl || build?.artifacts?.applicationArchiveUrl || ''; process.stdout.write(url);")"

if [[ "$BUILD_STATUS" != "FINISHED" ]]; then
  echo "EAS build $BUILD_ID finished with status $BUILD_STATUS" >&2
  exit 1
fi

if [[ -z "$ARTIFACT_URL" ]]; then
  echo "EAS build $BUILD_ID finished, but no artifact URL was returned." >&2
  exit 1
fi

OUTPUT_PATH="$ROOT_DIR/apk/latest-${PROFILE}.apk"
curl -L --fail "$ARTIFACT_URL" -o "$OUTPUT_PATH"

echo "APK ready at $OUTPUT_PATH"
