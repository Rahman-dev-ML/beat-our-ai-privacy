import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  text: string;
  tone?: 'default' | 'win' | 'lose' | 'draw' | 'think';
};

export function StatusBanner({ text, tone = 'default' }: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(8);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [text, fade, slide]);

  const toneColor =
    tone === 'lose'
      ? colors.ai
      : tone === 'draw'
        ? colors.draw
        : tone === 'win'
          ? colors.you
          : tone === 'think'
            ? colors.mute
            : colors.ink;

  return (
    <View style={styles.wrap}>
      <Animated.Text
        style={[
          styles.text,
          { color: toneColor, opacity: fade, transform: [{ translateY: slide }] },
        ]}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  text: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
});
