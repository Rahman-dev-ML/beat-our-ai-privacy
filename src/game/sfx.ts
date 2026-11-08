import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Lightweight SFX: WebAudio beeps on web, haptics elsewhere. */
function beep(freq: number, ms: number, type: OscillatorType = 'square', gain = 0.04) {
  if (Platform.OS !== 'web') return;
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
    osc.stop(ctx.currentTime + ms / 1000);
    setTimeout(() => ctx.close(), ms + 50);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  pop() {
    beep(520, 70);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  place() {
    beep(340, 55);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  win() {
    beep(660, 80);
    setTimeout(() => beep(880, 100), 90);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  lose() {
    beep(180, 160, 'sawtooth', 0.05);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  power() {
    beep(740, 60, 'triangle');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
  catch() {
    beep(920, 50);
    setTimeout(() => beep(1100, 70), 60);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
};
