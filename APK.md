# Android APK builds

Use these commands from the repo root:

```bash
npm run apk
npm run apk:release
npm run apk:eas
npm run apk:local
npm run apk:local:debug
```

What they do:

- `npm run apk`, `npm run apk:release`, and `npm run apk:eas` run an EAS cloud Android build with the `preview` profile and download the resulting APK into `./apk/`.
- `npm run apk:local` and `npm run apk:local:debug` use the generated Android project and Gradle on your machine.
- The local script reuses Android Studio's bundled JDK automatically when `JAVA_HOME` is not set.
- The local script reuses `~/Library/Android/sdk` automatically when `ANDROID_HOME` is not set.
- The local script generates the `android/` directory with Expo prebuild if it does not exist yet.
- The local script builds with an in-repo cache at `.gradle-home/`.

Output paths:

- EAS preview APK: `apk/latest-preview.apk`
- Local release APK: `apk/latest-release.apk`
- Local debug APK: `apk/latest-debug.apk`

Notes:

- The generated `android/` directory is currently ignored by Git in this repo.
- The local release APK currently uses the default debug signing config from Expo's generated Gradle project. That is fine for local installs and sharing test builds, but not for Play Store submission.
- Local release builds currently hit a React Native/Gradle toolchain incompatibility on this machine, so the EAS path is the reliable default.
