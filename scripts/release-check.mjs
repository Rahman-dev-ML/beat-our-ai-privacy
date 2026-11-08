/**
 * Release gate checks for Beat Our AI 1.1.0 package layout.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const required = [
  'package.json',
  'app.json',
  'eas.json',
  'App.tsx',
  'index.ts',
  'README.md',
  'src/game/logic.ts',
  'src/game/ai.ts',
  'src/screens/GameScreen.tsx',
  'src/screens/HomeScreen.tsx',
  'src/components/IncidentReport.tsx',
  'src/components/ScoreBoard.tsx',
  'release/RELEASE-CHECKLIST.md',
  'release/store-listing.md',
  'release/privacy-policy.html',
  'release/TEST-REPORT.md',
  'scripts/verify-ai.mjs',
  'android/app/build.gradle',
  'android/settings.gradle',
];

let failed = 0;
for (const rel of required) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    console.error(`MISSING ${rel}`);
    failed += 1;
  } else {
    console.log(`OK ${rel}`);
  }
}

const app = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
const pkg = app?.expo?.android?.package;
if (pkg !== 'com.beatoireai.tictactoe') {
  console.error(`BAD package: ${pkg}`);
  failed += 1;
} else {
  console.log('OK android.package');
}

if (app?.expo?.version !== '1.1.0' || app?.expo?.android?.versionCode !== 2) {
  console.error(`BAD version: ${app?.expo?.version} / ${app?.expo?.android?.versionCode}`);
  failed += 1;
} else {
  console.log('OK version 1.1.0 / versionCode 2');
}

const modes = readFileSync(join(root, 'src/game/logic.ts'), 'utf8');
if (modes.includes("'timed'") || modes.includes("'misere'")) {
  console.error('BAD: Timed or Misère still present in MODE_CONFIG');
  failed += 1;
} else {
  console.log('OK Timed/Misère removed');
}

if (existsSync(join(root, 'src/game/powerups.ts'))) {
  console.error('BAD: powerups.ts still present');
  failed += 1;
} else {
  console.log('OK power-ups removed');
}

if (failed) {
  console.error(`\nrelease:check FAILED (${failed})`);
  process.exit(1);
}
console.log('\nrelease:check PASSED');
