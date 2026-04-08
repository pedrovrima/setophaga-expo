#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_SETTINGS="$ROOT_DIR/node_modules/@react-native/gradle-plugin/settings.gradle.kts"

if [[ ! -f "$PLUGIN_SETTINGS" ]]; then
  exit 0
fi

CURRENT_LINE='plugins { id("org.gradle.toolchains.foojay-resolver-convention").version("0.5.0") }'
PATCHED_LINE='plugins { id("org.gradle.toolchains.foojay-resolver-convention").version("1.0.0") }'

if grep -Fq "$CURRENT_LINE" "$PLUGIN_SETTINGS"; then
  sed -i.bak 's/version("0.5.0")/version("1.0.0")/' "$PLUGIN_SETTINGS"
  rm -f "$PLUGIN_SETTINGS.bak"
fi
