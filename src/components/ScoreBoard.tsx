import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  you: number;
  ai: number;
  match: number;
};

export function ScoreBoard({ you, ai, match }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.title}>Score</Text>
        <Text style={styles.match}>Match #{String(match).padStart(3, '0')}</Text>
      </View>
      <View style={styles.row}>
        <ScorePill label="YOU" value={you} accent={colors.you} />
        <ScorePill label="AI" value={ai} accent={colors.ai} />
      </View>
    </View>
  );
}

function ScorePill({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.label, { color: accent }]}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 8,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: colors.ink,
  },
  match: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: colors.mute,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  pill: {
    flex: 1,
    backgroundColor: colors.panel,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    letterSpacing: 1.2,
  },
  value: {
    marginTop: 2,
    fontFamily: 'Bungee_400Regular',
    fontSize: 22,
    color: colors.ink,
  },
});
