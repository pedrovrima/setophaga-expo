#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_TYPE="${1:-release}"

case "$BUILD_TYPE" in
  debug)
    GRADLE_TASK="assembleDebug"
    SOURCE_APK_REL="android/app/build/outputs/apk/debug/app-debug.apk"
    OUTPUT_NAME="latest-debug.apk"
    ;;
  release)
    GRADLE_TASK="assembleRelease"
    SOURCE_APK_REL="android/app/build/outputs/apk/release/app-release.apk"
    OUTPUT_NAME="latest-release.apk"
    ;;
  *)
    echo "Unsupported build type: $BUILD_TYPE" >&2
    echo "Usage: ./scripts/build-android-apk.sh [debug|release]" >&2
    exit 1
    ;;
esac

if [[ -z "${JAVA_HOME:-}" && -d "/Applications/Android Studio.app/Contents/jbr/Contents/Home" ]]; then
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
fi

if [[ -z "${ANDROID_HOME:-}" && -d "$HOME/Library/Android/sdk" ]]; then
  export ANDROID_HOME="$HOME/Library/Android/sdk"
fi

if [[ -z "${JAVA_HOME:-}" ]]; then
  echo "JAVA_HOME is not set and Android Studio's bundled JDK was not found." >&2
  exit 1
fi

if [[ -z "${ANDROID_HOME:-}" ]]; then
  echo "ANDROID_HOME is not set and ~/Library/Android/sdk was not found." >&2
  exit 1
fi

cd "$ROOT_DIR"

if [[ ! -d node_modules ]]; then
  echo "node_modules is missing. Run npm install first." >&2
  exit 1
fi

if [[ ! -d android ]]; then
  npx expo prebuild --platform android --no-install
fi

export GRADLE_USER_HOME="$ROOT_DIR/.gradle-home"

cd "$ROOT_DIR/android"
./gradlew "$GRADLE_TASK"

cd "$ROOT_DIR"
mkdir -p apk
cp "$SOURCE_APK_REL" "apk/$OUTPUT_NAME"

echo "APK ready at $ROOT_DIR/apk/$OUTPUT_NAME"
