import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = {
  text: string;
  color: string;
  active?: boolean;
};

/** Typewriter-ish status line for thinking / taunts. */
export function TypewriterStatus({ text, color, active = true }: Props) {
  const [shown, setShown] = React.useState(active ? '' : text);
  const idx = useRef(0);

  useEffect(() => {
    if (!active) {
      setShown(text);
      return;
    }
    setShown('');
    idx.current = 0;
    const id = setInterval(() => {
      idx.current += 1;
      setShown(text.slice(0, idx.current));
      if (idx.current >= text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [text, active]);

  return (
    <Text style={[styles.text, { color }]}>
      {shown}
      {active && shown.length < text.length ? '▌' : ''}
    </Text>
  );
}

export function ConfettiBurst({ play }: { play: boolean }) {
  const bits = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      o: new Animated.Value(0),
      emoji: ['🎉', '✨', '🏆', '⭐', '🎊'][i % 5],
      left: 20 + (i * 17) % 70,
    })),
  ).current;

  useEffect(() => {
    if (!play) return;
    bits.forEach((b, i) => {
      b.x.setValue(0);
      b.y.setValue(0);
      b.o.setValue(1);
      Animated.parallel([
        Animated.timing(b.y, {
          toValue: 80 + (i % 5) * 18,
          duration: 900 + i * 30,
          useNativeDriver: true,
        }),
        Animated.timing(b.x, {
          toValue: (i % 2 === 0 ? -1 : 1) * (20 + (i % 4) * 12),
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(b.o, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [play, bits]);

  if (!play) return null;

  return (
    <View pointerEvents="none" style={styles.confettiWrap}>
      {bits.map((b, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.confetti,
            {
              left: `${b.left}%`,
              opacity: b.o,
              transform: [{ translateX: b.x }, { translateY: b.y }],
            },
          ]}
        >
          {b.emoji}
        </Animated.Text>
      ))}
    </View>
  );
}

export function ShakeView({
  shake,
  children,
}: {
  shake: boolean;
  children: React.ReactNode;
}) {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!shake) return;
    Animated.sequence([
      Animated.timing(x, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(x, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(x, { toValue: 6, duration: 40, useNativeDriver: true }),
      Animated.timing(x, { toValue: -6, duration: 40, useNativeDriver: true }),
      Animated.timing(x, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  }, [shake, x]);

  return <Animated.View style={{ transform: [{ translateX: x }] }}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    minHeight: 44,
  },
  confettiWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
    zIndex: 20,
  },
  confetti: {
    position: 'absolute',
    fontSize: 22,
  },
});
