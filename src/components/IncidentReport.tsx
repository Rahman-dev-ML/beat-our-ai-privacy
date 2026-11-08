import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { APPEAL_LINES, INCIDENT_EMPTY, randomFrom } from '../game/taunts';
import { colors } from '../theme/colors';

export type Incident = {
  id: string;
  text: string;
};

type Props = {
  incidents: Incident[];
  onAppeal: (line: string) => void;
};

export function IncidentReport({ incidents, onAppeal }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.title}>Incident log</Text>
        <Text style={styles.count}>
          {incidents.length} flag{incidents.length === 1 ? '' : 's'}
        </Text>
      </View>

      <ScrollView style={styles.list} nestedScrollEnabled>
        {incidents.length === 0 ? (
          <Text style={styles.empty}>{INCIDENT_EMPTY}</Text>
        ) : (
          incidents.map((item, i) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{i + 1}</Text>
              </View>
              <Text style={styles.item}>{item.text}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Pressable
        onPress={() => onAppeal(randomFrom(APPEAL_LINES))}
        style={({ pressed }) => [styles.appeal, pressed && { opacity: 0.88 }]}
      >
        <Text style={styles.appealText}>File an appeal</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    width: '100%',
    maxHeight: 220,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: colors.ink,
  },
  count: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: colors.mute,
  },
  list: {
    maxHeight: 110,
    paddingHorizontal: 14,
  },
  empty: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.mute,
    textAlign: 'center',
    paddingVertical: 24,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  badgeText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: '#1A0E08',
  },
  item: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
  },
  appeal: {
    margin: 12,
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.cell,
    alignItems: 'center',
  },
  appealText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: colors.ink,
  },
});
