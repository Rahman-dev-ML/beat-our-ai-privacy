# Beat Our AI 1.1.0 — Android release candidate

A complete offline single-player Tic Tac Toe game with a portrait mobile UI.
Source, Expo config, EAS build profiles, and store materials are included.
No server, API keys, or cloud login are required for gameplay.

## What’s new in 1.1.0

- Power-ups (Undo / Swap / Freeze) removed for a cleaner match
- Session scoreboard: YOU vs AI across rematches
- Incident log when the AI gets shady (nervous rounds, catch window, appeals)
- Same Beat Our AI branding and dark teal / orange theme

## Build / open the Android project

1. Install Node.js 20.19 or newer and Android Studio with JDK 17+.
2. Extract this archive. Open a terminal in the folder containing `package.json`.
3. Run `npm ci` (internet required for dependencies). If no lockfile, run `npm install`.
4. Run `npm test` and `npm run release:check`.
5. Open the included `android` folder in Android Studio, or run `npm run android`
   with a device/emulator connected.
6. Walk `release/RELEASE-CHECKLIST.md` on a phone.

### Cloud APK / Play AAB (EAS)

1. Run `npx eas-cli login` with the publisher Expo account.
2. Run `npm run android:apk` for a shareable APK, or
   `npm run android:aab` for a Play Store App Bundle.
3. Download the artifact from the Expo build page.
4. For Play Console: upload the signed AAB to a testing track first.
   Preserve upload-key access (Expo-managed or local backup). Do not commit
   keystores or passwords.

Default application ID: `com.beatoireai.tictactoe`. Choose and verify your final
unique package ID BEFORE first Play upload; it cannot be changed for that listing.

This source targets Expo SDK 57. Version `1.1.0` · version code `2`.

## Features

- Classic 3×3, 4×4, 5×5, and Ultimate boards
- Nervous rounds (every 5th game and some random games): softer AI, real wins count
- Cliffhanger pauses when you are one mark from a line
- Occasional quiet draw rewrite with Catch the cheater + incident log
- Local play only. No ads, accounts, or purchases

Timed and Misère modes are not in this release.

## Release status — read before publishing

Automated TypeScript and AI helper checks are documented in `release/TEST-REPORT.md`.
Build a preview APK with EAS (`npm run android:apk`) before device QA.
Real-device validation, Play pre-launch, and store forms are still owner gates —
see `release/RELEASE-CHECKLIST.md`.

## Editing

`src/game/` owns rules, AI, cheats, and copy. `src/screens/` owns home and match
UI. `App.tsx` owns navigation. After editing: `npm test`, then rebuild with EAS.

## Data / security

Only in-memory session scores while the app is open. No secrets are included.
