import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CellValue } from '../game/logic';
import { colors } from '../theme/colors';

type Props = {
  value: CellValue;
  index: number;
  disabled: boolean;
  highlight: boolean;
  suspect?: boolean;
  fontSize?: number;
  onPress: (index: number) => void;
};

export function Cell({
  value,
  index,
  disabled,
  highlight,
  suspect,
  fontSize = 36,
  onPress,
}: Props) {
  const markColor = value === 'X' ? colors.you : colors.ai;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || value !== null}
      onPress={() => onPress(index)}
      style={({ pressed }) => [
        styles.cell,
        {
          borderColor: suspect ? colors.accent : highlight ? colors.you : colors.line,
        },
        highlight && { backgroundColor: colors.panel },
        suspect && { borderWidth: 2 },
        pressed && !value && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      {value ? (
        <Text
          style={{
            fontSize,
            fontFamily: 'Bungee_400Regular',
            color: markColor,
            lineHeight: fontSize + 10,
          }}
        >
          {value}
        </Text>
      ) : (
        <View style={styles.dot} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: colors.cell,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    opacity: 0.5,
    backgroundColor: colors.line,
  },
});
