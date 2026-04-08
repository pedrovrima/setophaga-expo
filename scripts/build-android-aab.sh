#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Set JAVA_HOME if not set
if [[ -z "${JAVA_HOME:-}" && -d "/Applications/Android Studio.app/Contents/jbr/Contents/Home" ]]; then
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
fi

# Set ANDROID_HOME if not set
if [[ -z "${ANDROID_HOME:-}" && -d "$HOME/Library/Android/sdk" ]]; then
  export ANDROID_HOME="$HOME/Library/Android/sdk"
fi

# Validate environment
if [[ -z "${JAVA_HOME:-}" ]]; then
  echo "❌ JAVA_HOME is not set and Android Studio's bundled JDK was not found." >&2
  exit 1
fi

if [[ -z "${ANDROID_HOME:-}" ]]; then
  echo "❌ ANDROID_HOME is not set and ~/Library/Android/sdk was not found." >&2
  exit 1
fi

echo "✅ JAVA_HOME: $JAVA_HOME"
echo "✅ ANDROID_HOME: $ANDROID_HOME"
echo ""

cd "$ROOT_DIR"

# Check node_modules
if [[ ! -d node_modules ]]; then
  echo "❌ node_modules is missing. Run npm install first." >&2
  exit 1
fi

# Prebuild if needed
if [[ ! -d android ]]; then
  echo "📦 Running expo prebuild..."
  npx expo prebuild --platform android --no-install
fi

# Set Gradle home
export GRADLE_USER_HOME="$ROOT_DIR/.gradle-home"

# Build AAB
echo "🏗️  Building Android App Bundle (AAB)..."
cd "$ROOT_DIR/android"
./gradlew bundleRelease

cd "$ROOT_DIR"

# Create output directory
mkdir -p aab

# Copy AAB to output folder
SOURCE_AAB="android/app/build/outputs/bundle/release/app-release.aab"
OUTPUT_AAB="aab/app-release.aab"

if [[ -f "$SOURCE_AAB" ]]; then
  cp "$SOURCE_AAB" "$OUTPUT_AAB"
  echo ""
  echo "✅ AAB pronto em: $ROOT_DIR/$OUTPUT_AAB"
  echo ""
  echo "📤 Próximos passos:"
  echo "1. Acesse https://play.google.com/console"
  echo "2. Selecione o app Xará"
  echo "3. Vá em Produção → Criar nova versão"
  echo "4. Faça upload do arquivo: $OUTPUT_AAB"
else
  echo "❌ Erro: AAB não foi gerado em $SOURCE_AAB" >&2
  exit 1
fi
