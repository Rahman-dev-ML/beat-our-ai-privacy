import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Cell } from './Cell';
import { TypewriterStatus } from './Effects';
import { ScoreBoard } from './ScoreBoard';
import { getBestMove } from '../game/ai';
import { AI, GameOutcome, PLAYER } from '../game/logic';
import { sfx } from '../game/sfx';
import {
  AFTER_AI_MOVE,
  AFTER_PLAYER_MOVE,
  INTRO_LINES,
  THINKING_LINES,
  randomFrom,
  statusForResult,
} from '../game/taunts';
import {
  emptyUltimate,
  getUltimateAiMove,
  playUltimateMove,
  ultimateWinner,
  UltimateState,
} from '../game/ultimate';
import { GRADIENT, colors } from '../theme/colors';

type Props = {
  luckyFair: boolean;
  youScore: number;
  aiScore: number;
  matchNumber: number;
  onExit: () => void;
  onGameEnd: (outcome: GameOutcome) => void;
  onRematch: () => void;
};

export function UltimateBoard({
  luckyFair,
  youScore,
  aiScore,
  matchNumber,
  onExit,
  onGameEnd,
  onRematch,
}: Props) {
  const [state, setState] = useState<UltimateState>(emptyUltimate);
  const [status, setStatus] = useState(
    luckyFair ? 'Nervous ultimate. The AI might blink.' : randomFrom(INTRO_LINES),
  );
  const [thinking, setThinking] = useState(false);
  const [over, setOver] = useState<'X' | 'O' | null>(null);
  const locked = useRef(false);
  const scored = useRef(false);

  const end = (who: 'X' | 'O') => {
    setOver(who);
    setStatus(statusForResult(who));
    if (scored.current) return;
    scored.current = true;
    if (who === PLAYER) {
      sfx.win();
      onGameEnd('you');
    } else {
      sfx.lose();
      onGameEnd('house');
    }
  };

  const aiPlay = async (from: UltimateState) => {
    setThinking(true);
    setStatus(randomFrom(THINKING_LINES));
    await new Promise((r) => setTimeout(r, 350));
    const soft = luckyFair || Math.random() < 0.2;
    let move = getUltimateAiMove(from);
    if (soft && move) {
      const local = getBestMove(from.boards[move.boardIndex], {
        size: 3,
        winLength: 3,
        soft: true,
      });
      if (local >= 0) move = { boardIndex: move.boardIndex, cellIndex: local };
    }
    if (!move) {
      setThinking(false);
      locked.current = false;
      return;
    }
    const next = playUltimateMove(from, move.boardIndex, move.cellIndex, AI);
    if (!next) {
      setThinking(false);
      locked.current = false;
      return;
    }
    setState(next);
    sfx.pop();
    const w = ultimateWinner(next.meta);
    if (w === 'X' || w === 'O') end(w);
    else setStatus(randomFrom(AFTER_AI_MOVE));
    setThinking(false);
    locked.current = false;
  };

  const onPress = async (boardIndex: number, cellIndex: number) => {
    if (locked.current || thinking || over) return;
    locked.current = true;
    const next = playUltimateMove(state, boardIndex, cellIndex, PLAYER);
    if (!next) {
      locked.current = false;
      return;
    }
    setState(next);
    sfx.place();
    setStatus(randomFrom(AFTER_PLAYER_MOVE));
    const w = ultimateWinner(next.meta);
    if (w === 'X' || w === 'O') {
      end(w);
      locked.current = false;
      return;
    }
    await aiPlay(next);
  };

  const rematch = () => {
    setState(emptyUltimate());
    setOver(null);
    scored.current = false;
    locked.current = false;
    setStatus(
      luckyFair ? 'Nervous ultimate. The AI might blink.' : randomFrom(INTRO_LINES),
    );
    onRematch();
  };

  return (
    <LinearGradient colors={GRADIENT} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={onExit}>
            <Text style={styles.menuLink}>← Menu</Text>
          </Pressable>
          <Text style={styles.title}>Ultimate</Text>
          <Text style={styles.badge}>{luckyFair ? 'NERVOUS' : 'AI'}</Text>
        </View>
        <TypewriterStatus text={status} color={colors.ink} active={thinking} />
        <View style={styles.meta}>
          {Array.from({ length: 3 }, (_, br) => (
            <View key={br} style={styles.metaRow}>
              {Array.from({ length: 3 }, (_, bc) => {
                const bi = br * 3 + bc;
                const claimed = state.meta[bi];
                const active =
                  state.active === null ? !claimed : state.active === bi && !claimed;
                return (
                  <View
                    key={bi}
                    style={[
                      styles.mini,
                      {
                        borderColor: active ? colors.accent : colors.line,
                        opacity: claimed ? 0.85 : 1,
                      },
                    ]}
                  >
                    {claimed ? (
                      <Text
                        style={{
                          fontSize: 28,
                          color: claimed === 'X' ? colors.you : colors.ai,
                          fontFamily: 'Bungee_400Regular',
                        }}
                      >
                        {claimed}
                      </Text>
                    ) : (
                      <View style={{ width: '100%' }}>
                        {Array.from({ length: 3 }, (_, r) => (
                          <View key={r} style={{ flexDirection: 'row' }}>
                            {Array.from({ length: 3 }, (_, c) => {
                              const ci = r * 3 + c;
                              return (
                                <View key={ci} style={{ flex: 1, aspectRatio: 1 }}>
                                  <Cell
                                    index={ci}
                                    value={state.boards[bi][ci]}
                                    disabled={!active || thinking || !!over}
                                    highlight={false}
                                    fontSize={12}
                                    onPress={() => onPress(bi, ci)}
                                  />
                                </View>
                              );
                            })}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        {over ? (
          <Pressable onPress={rematch} style={styles.again}>
            <Text style={styles.againText}>PLAY AGAIN</Text>
          </Pressable>
        ) : null}
        <ScoreBoard you={youScore} ai={aiScore} match={matchNumber} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 12, paddingBottom: 28, gap: 12 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuLink: { color: colors.mute, fontFamily: 'DMSans_700Bold' },
  title: { color: colors.ink, fontFamily: 'DMSans_700Bold' },
  badge: { color: colors.accent, fontFamily: 'DMSans_700Bold' },
  meta: { gap: 6 },
  metaRow: { flexDirection: 'row', gap: 6 },
  mini: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 2,
    backgroundColor: colors.panel,
  },
  again: {
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.accent,
  },
  againText: { fontFamily: 'Bungee_400Regular', color: '#1A0E08', fontSize: 16 },
});
