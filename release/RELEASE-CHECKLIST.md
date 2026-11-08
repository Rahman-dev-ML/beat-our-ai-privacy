# Owner release gates (v1.1.0)

## Build and device gates
- [ ] Preview APK installs on a real Android phone (`npm run android:apk`).
- [ ] First launch and relaunch do not crash.
- [ ] Airplane mode: a full classic game can be played with no network.
- [ ] Classic, 4×4, 5×5, and Ultimate each start and accept taps.
- [ ] Timed and Misère are not in the mode list.
- [ ] Undo / Swap / Freeze are gone from the match UI.
- [ ] A completed X line shows a player win (confetti). It is not rewritten into an AI win.
- [ ] Some full-board ties stay ties. Some briefly offer Catch the cheater, then count as an AI win if ignored.
- [ ] Catch / nervous / appeal lines appear in the incident log.
- [ ] YOU vs AI score increments across PLAY AGAIN.
- [ ] Nervous badge appears on every 5th completed game and on some other rounds.
- [ ] Close threats pause with a tense status line before the AI moves.
- [ ] Hardware Back leaves the game screen for the menu, then leaves the app.
- [ ] Small phone and a taller phone: board and Play stay on screen.
- [ ] TalkBack can focus cells. Marks are announced.
- [ ] Run Google Play pre-launch report and resolve reported defects.

## Store gates
- [ ] Confirm `com.beatoireai.tictactoe` is the final package name. It cannot change after the first upload.
- [ ] Add publisher name and support email to privacy-policy.html.
- [ ] Host the privacy policy publicly. Do not use a private preview URL.
- [ ] Add support email and developer details in Play Console.
- [ ] Upload a 512×512 icon and a 1024×500 feature graphic. Add real Android screenshots.
- [ ] Complete Data safety, audience, app-access, and content rating forms.
- [ ] Confirm the target API Play currently requires.
- [ ] Build the production AAB (`eas build -p android --profile production`).
- [ ] Roll out through a testing track before production.

This list is work still to do. It is not a claim that Play has approved the app.
