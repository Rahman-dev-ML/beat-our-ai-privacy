# App Store (iOS)

## Privacy Policy URL (paste into App Store Connect)
https://cdn.jsdelivr.net/gh/Rahman-dev-ML/beat-our-ai-privacy@main/privacy.html

## Bundle ID
com.beatoireai.tictactoe

## Build
```bash
npm ci
npx eas-cli login
npx eas-cli build -p ios --profile production
```

After App Store Connect shows the build, set `ascAppId` in `eas.json` then:
```bash
npx eas-cli submit -p ios --profile production
```
