import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameModeId, MODE_CONFIG } from '../game/logic';
import { COPY } from '../game/taunts';
import { GRADIENT, colors } from '../theme/colors';

type Props = {
  mode: GameModeId;
  gamesPlayed: number;
  onMode: (m: GameModeId) => void;
  onPlay: () => void;
};

export function HomeScreen({ mode, gamesPlayed, onMode, onPlay }: Props) {
  const nextLucky = 5 - (gamesPlayed % 5);

  return (
    <LinearGradient colors={GRADIENT} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>{COPY.brand}</Text>
        <Text style={styles.tag}>{COPY.tagline}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>The AI can slip</Text>
          <Text style={styles.cardBody}>
            {nextLucky === 5
              ? 'This round the AI is nervous. A real win is on the table.'
              : `Sharp most rounds. Nervous every 5th. Next nervous round in ${nextLucky}.`}
          </Text>
        </View>

        <Text style={styles.section}>Mode</Text>
        <View style={styles.grid}>
          {(Object.keys(MODE_CONFIG) as GameModeId[]).map((id) => {
            const m = MODE_CONFIG[id];
            const on = mode === id;
            return (
              <Pressable
                key={id}
                onPress={() => onMode(id)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipTitle, on && styles.chipTitleOn]}>{m.label}</Text>
                <Text style={[styles.chipBlurb, on && styles.chipBlurbOn]}>{m.blurb}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={onPlay}
          style={({ pressed }) => [styles.play, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.playText}>PLAY</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  brand: {
    fontFamily: 'Bungee_400Regular',
    fontSize: 30,
    textAlign: 'center',
    marginTop: 8,
    color: colors.accent,
  },
  tag: {
    fontFamily: 'DMSans_500Medium',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    fontSize: 14,
    color: colors.mute,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    backgroundColor: colors.panel,
    borderColor: colors.line,
  },
  cardTitle: {
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
    marginBottom: 4,
    color: colors.ink,
  },
  cardBody: {
    color: colors.mute,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
  section: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
    color: colors.ink,
  },
  grid: { gap: 8, marginBottom: 24 },
  chip: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    backgroundColor: colors.cell,
    borderColor: colors.line,
  },
  chipOn: { backgroundColor: colors.accent },
  chipTitle: { fontFamily: 'DMSans_700Bold', color: colors.ink, fontSize: 13 },
  chipTitleOn: { color: '#1A0E08' },
  chipBlurb: {
    fontFamily: 'DMSans_400Regular',
    color: colors.mute,
    fontSize: 11,
    marginTop: 2,
  },
  chipBlurbOn: { color: '#3A2418' },
  play: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  playText: {
    fontFamily: 'Bungee_400Regular',
    fontSize: 20,
    color: '#1A0E08',
  },
});
