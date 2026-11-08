/**
 * Package-level smoke tests for release layout and mode list.
 */
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const root = process.cwd();

test('app package and version', () => {
  const app = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
  assert.equal(app.expo.name, 'Beat Our AI');
  assert.equal(app.expo.version, '1.1.0');
  assert.equal(app.expo.android.package, 'com.beatoireai.tictactoe');
  assert.equal(app.expo.android.versionCode, 2);
});

test('Timed and Misère removed', () => {
  const logic = readFileSync(join(root, 'src/game/logic.ts'), 'utf8');
  assert.ok(logic.includes("'classic'"));
  assert.ok(logic.includes("'ultimate'"));
  assert.equal(logic.includes("| 'timed'"), false);
  assert.equal(logic.includes("| 'misere'"), false);
});

test('power-ups removed', () => {
  assert.equal(existsSync(join(root, 'src/game/powerups.ts')), false);
  const logic = readFileSync(join(root, 'src/game/logic.ts'), 'utf8');
  assert.equal(logic.includes('PowerUpId'), false);
  const game = readFileSync(join(root, 'src/screens/GameScreen.tsx'), 'utf8');
  assert.equal(game.includes('undo'), false);
  assert.equal(game.includes('POWERUP'), false);
});

test('store materials present', () => {
  for (const f of [
    'release/store-listing.md',
    'release/privacy-policy.html',
    'release/RELEASE-CHECKLIST.md',
    'release/TEST-REPORT.md',
  ]) {
    assert.ok(existsSync(join(root, f)), f);
  }
});
