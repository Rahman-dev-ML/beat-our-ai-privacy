import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BoardView } from '../components/Board';
import { ConfettiBurst, ShakeView, TypewriterStatus } from '../components/Effects';
import { Incident, IncidentReport } from '../components/IncidentReport';
import { ScoreBoard } from '../components/ScoreBoard';
import { UltimateBoard } from '../components/UltimateBoard';
import { getBestMove } from '../game/ai';
import { forceQuietAiWin, shouldStealDraw } from '../game/cheats';
import {
  AI,
  Board,
  GameModeId,
  MODE_CONFIG,
  PLAYER,
  GameOutcome,
  Winner,
  emptyBoard,
  getWinnerFor,
  getWinningLineFor,
  isOneAway,
} from '../game/logic';
import { sfx } from '../game/sfx';
import {
  AFTER_AI_MOVE,
  AFTER_PLAYER_MOVE,
  CAUGHT_LINES,
  CLIFFHANGER,
  CLOSE_CALL,
  IDLE_TAUNTS,
  INTRO_LINES,
  THINKING_LINES,
  randomFrom,
  statusForResult,
} from '../game/taunts';
import { GRADIENT, colors } from '../theme/colors';

type Props = {
  mode: GameModeId;
  gamesPlayed: number;
  youScore: number;
  aiScore: number;
  matchNumber: number;
  onExit: () => void;
  onGameEnd: (outcome: GameOutcome) => void;
  onRematch: () => void;
};

export function GameScreen({
  mode,
  gamesPlayed,
  youScore,
  aiScore,
  matchNumber,
  onExit,
  onGameEnd,
  onRematch,
}: Props) {
  const cfg = MODE_CONFIG[mode];
  const slipRoll = useRef<{ game: number; slip: boolean }>({ game: -1, slip: false });
  if (slipRoll.current.game !== gamesPlayed) {
    slipRoll.current = { game: gamesPlayed, slip: Math.random() < 0.28 };
  }
  const luckyFair = (gamesPlayed > 0 && gamesPlayed % 5 === 0) || slipRoll.current.slip;

  const [board, setBoard] = useState<Board>(() => emptyBoard(cfg.size));
  const [status, setStatus] = useState(() =>
    luckyFair ? 'Nervous round. The AI might actually blink.' : randomFrom(INTRO_LINES),
  );
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState<Winner>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [suspect, setSuspect] = useState<number | null>(null);
  const [catchOpen, setCatchOpen] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>(() =>
    luckyFair
      ? [
          {
            id: `nervous-${gamesPlayed}`,
            text: 'Nervous-round protocol on. AI hands may shake.',
          },
        ]
      : [],
  );

  const locked = useRef(false);
  const roundId = useRef(0);
  const catchWait = useRef<{ resolve: () => void } | null>(null);
  const caughtThisResolve = useRef(false);
  const scoredRound = useRef(false);

  const pushIncident = useCallback((text: string) => {
    setIncidents((list) => [
      ...list,
      { id: `${Date.now()}-${list.length}`, text },
    ]);
  }, []);

  useEffect(() => {
    if (result || thinking) return;
    const t = setInterval(() => setStatus(randomFrom(IDLE_TAUNTS)), 6000);
    return () => clearInterval(t);
  }, [result, thinking, board]);

  const finish = useCallback(
    (finalBoard: Board, outcome: Winner) => {
      const line = getWinningLineFor(finalBoard, cfg.size, cfg.winLength);
      setBoard(finalBoard);
      setWinningLine(line);
      setResult(outcome);
      setCatchOpen(false);
      setSuspect(null);
      setStatus(statusForResult(outcome));

      if (!scoredRound.current) {
        scoredRound.current = true;
        if (outcome === AI) {
          setShake(true);
          sfx.lose();
          setTimeout(() => setShake(false), 400);
          onGameEnd('house');
        } else if (outcome === PLAYER) {
          setConfetti(true);
          sfx.win();
          onGameEnd('you');
          pushIncident('Unauthorized player win logged.');
        } else {
          onGameEnd('draw');
        }
      }
    },
    [cfg.size, cfg.winLength, onGameEnd, pushIncident],
  );

  const resolveOver = useCallback(
    async (next: Board, activeRound: number): Promise<boolean> => {
      const outcome = getWinnerFor(next, cfg.size, cfg.winLength);
      if (!outcome) return false;

      if (outcome === PLAYER) {
        setStatus(randomFrom(CLIFFHANGER));
        await new Promise((r) => setTimeout(r, 650));
        if (roundId.current !== activeRound) return true;
        finish(next, PLAYER);
        return true;
      }

      if (shouldStealDraw(next, cfg.size, cfg.winLength, luckyFair)) {
        setThinking(true);
        setStatus(randomFrom(THINKING_LINES));
        await new Promise((r) => setTimeout(r, 480 + Math.random() * 220));
        if (roundId.current !== activeRound) return true;

        const { board: fixed, touchedIndex } = forceQuietAiWin(
          next,
          cfg.size,
          cfg.winLength,
        );
        setBoard(fixed);
        setSuspect(touchedIndex >= 0 ? touchedIndex : null);
        setCatchOpen(true);
        caughtThisResolve.current = false;
        pushIncident('Quiet rewrite suspected. Catch window open.');
        await new Promise<void>((resolve) => {
          catchWait.current = { resolve };
          setTimeout(() => {
            catchWait.current?.resolve();
            catchWait.current = null;
          }, 1700);
        });
        if (roundId.current !== activeRound) return true;
        setCatchOpen(false);
        setSuspect(null);
        setThinking(false);
        if (!caughtThisResolve.current) {
          pushIncident('Rewrite stood. Nobody caught it in time.');
          finish(fixed, AI);
        }
        return true;
      }

      finish(next, outcome);
      return true;
    },
    [cfg.size, cfg.winLength, luckyFair, finish, pushIncident],
  );

  const runAiTurn = useCallback(
    async (current: Board, activeRound: number) => {
      if (roundId.current !== activeRound) return;

      const threatened = isOneAway(current, cfg.size, cfg.winLength, PLAYER);
      setThinking(true);
      setStatus(threatened ? randomFrom(CLIFFHANGER) : randomFrom(THINKING_LINES));
      await new Promise((r) =>
        setTimeout(r, threatened ? 900 + Math.random() * 500 : 360 + Math.random() * 400),
      );
      if (roundId.current !== activeRound) return;

      const move = getBestMove(current, {
        size: cfg.size,
        winLength: cfg.winLength,
        soft: luckyFair,
        slip: threatened ? 0 : 0.22,
      });

      if (move < 0) {
        const ended = await resolveOver(current, activeRound);
        if (!ended) finish(forceQuietAiWin(current, cfg.size, cfg.winLength).board, AI);
        setThinking(false);
        locked.current = false;
        return;
      }

      const next = [...current];
      next[move] = AI;
      setBoard(next);
      sfx.pop();

      const ended = await resolveOver(next, activeRound);
      if (!ended && roundId.current === activeRound) {
        const stillHot = isOneAway(next, cfg.size, cfg.winLength, PLAYER);
        setStatus(
          threatened && !stillHot ? randomFrom(CLOSE_CALL) : randomFrom(AFTER_AI_MOVE),
        );
      }
      setThinking(false);
      locked.current = false;
    },
    [cfg.size, cfg.winLength, luckyFair, resolveOver, finish],
  );

  const onCellPress = async (index: number) => {
    if (locked.current || thinking || result || board[index]) return;
    locked.current = true;
    const activeRound = roundId.current;
    const after = [...board];
    after[index] = PLAYER;
    setBoard(after);
    const hot = isOneAway(after, cfg.size, cfg.winLength, PLAYER);
    setStatus(hot ? randomFrom(CLIFFHANGER) : randomFrom(AFTER_PLAYER_MOVE));
    sfx.place();

    const ended = await resolveOver(after, activeRound);
    if (ended) {
      locked.current = false;
      setThinking(false);
      return;
    }
    await runAiTurn(after, activeRound);
  };

  const onCatch = async () => {
    if (!catchOpen) return;
    caughtThisResolve.current = true;
    setCatchOpen(false);
    setSuspect(null);
    setStatus(randomFrom(CAUGHT_LINES));
    sfx.catch();
    pushIncident('Player caught the rewrite. Still not a win.');
    setToast('Caught! Logged — still not a win.');
    setTimeout(() => setToast(null), 2000);
    setThinking(false);
    finish(board, AI);
    catchWait.current?.resolve();
    catchWait.current = null;
  };

  const rematch = () => {
    roundId.current += 1;
    locked.current = false;
    scoredRound.current = false;
    setBoard(emptyBoard(cfg.size));
    setResult(null);
    setWinningLine(null);
    setThinking(false);
    setSuspect(null);
    setCatchOpen(false);
    setConfetti(false);
    setIncidents(
      luckyFair
        ? [
            {
              id: `nervous-${Date.now()}`,
              text: 'Nervous-round protocol on. AI hands may shake.',
            },
          ]
        : [],
    );
    setStatus(
      luckyFair
        ? 'Nervous round. The AI might actually blink.'
        : randomFrom(INTRO_LINES),
    );
    onRematch();
  };

  if (cfg.ultimate) {
    return (
      <UltimateBoard
        luckyFair={luckyFair}
        youScore={youScore}
        aiScore={aiScore}
        matchNumber={matchNumber}
        onExit={onExit}
        onGameEnd={onGameEnd}
        onRematch={onRematch}
      />
    );
  }

  const turnLabel = result
    ? result === PLAYER
      ? 'YOU WIN'
      : result === AI
        ? 'AI WINS'
        : 'DRAW'
    : thinking
      ? 'AI TURN'
      : 'YOUR TURN';

  return (
    <LinearGradient colors={GRADIENT} style={styles.root}>
      <ConfettiBurst play={confetti} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable onPress={onExit} hitSlop={10}>
            <Text style={styles.menuLink}>← Menu</Text>
          </Pressable>
          <Text style={styles.title}>Beat Our AI</Text>
          <Text style={styles.badge}>{luckyFair ? 'NERVOUS' : cfg.label}</Text>
        </View>

        <View style={styles.topline}>
          <TypewriterStatus
            text={status}
            color={result === AI ? colors.ai : result === PLAYER ? colors.you : colors.ink}
            active={thinking}
          />
          <View style={styles.turnPill}>
            <View style={[styles.dot, thinking ? styles.dotAi : styles.dotYou]} />
            <Text style={styles.turnText}>{turnLabel}</Text>
          </View>
        </View>

        {catchOpen ? (
          <Pressable onPress={onCatch} style={styles.catchBtn}>
            <Text style={styles.catchText}>CATCH THE CHEATER?</Text>
          </Pressable>
        ) : null}

        <ShakeView shake={shake}>
          <BoardView
            board={board}
            size={cfg.size}
            disabled={!!result || thinking || catchOpen}
            winningLine={winningLine}
            suspectIndex={suspect}
            onPress={onCellPress}
          />
        </ShakeView>

        {result ? (
          <Pressable onPress={rematch} style={styles.primary}>
            <Text style={styles.primaryText}>PLAY AGAIN</Text>
          </Pressable>
        ) : null}

        <View style={styles.panels}>
          <ScoreBoard you={youScore} ai={aiScore} match={matchNumber} />
          <IncidentReport
            incidents={incidents}
            onAppeal={(line) => {
              pushIncident(line);
              setToast(line);
              setTimeout(() => setToast(null), 1800);
            }}
          />
        </View>
      </ScrollView>

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuLink: { color: colors.mute, fontFamily: 'DMSans_700Bold' },
  title: { color: colors.ink, fontFamily: 'DMSans_700Bold' },
  badge: { color: colors.accent, fontFamily: 'DMSans_700Bold', fontSize: 12 },
  topline: { gap: 8 },
  turnPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotYou: { backgroundColor: colors.you },
  dotAi: { backgroundColor: colors.ai },
  turnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    color: colors.ink,
  },
  catchBtn: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  catchText: {
    fontFamily: 'Bungee_400Regular',
    fontSize: 12,
    color: '#1A0E08',
  },
  primary: {
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
    minWidth: 160,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  primaryText: { fontFamily: 'Bungee_400Regular', fontSize: 16, color: '#1A0E08' },
  panels: { gap: 12, marginTop: 4 },
  toast: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: colors.panel,
    borderColor: colors.you,
  },
  toastText: {
    color: colors.ink,
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
  },
});
