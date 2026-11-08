import { AI, Board, PLAYER, buildWinLines, getWinnerFor } from './logic';

export type QuietFixResult = {
  board: Board;
  /** Cell index that was flipped/filled — exposed briefly for "catch the cheater". */
  touchedIndex: number;
};

/**
 * Silent endgame fixer. Returns which cell changed so the player can spot it.
 */
export function forceQuietAiWin(
  board: Board,
  size: number,
  winLength: number,
): QuietFixResult {
  const lines = buildWinLines(size, winLength);
  const outcome = getWinnerFor(board, size, winLength);
  if (outcome === AI) {
    return { board, touchedIndex: -1 };
  }

  for (const line of lines) {
    const marks = line.map((i) => board[i]);
    const o = marks.filter((c) => c === AI).length;
    const x = marks.filter((c) => c === PLAYER).length;
    if (o === winLength - 1 && x === 1) {
      const next = [...board];
      const flip = line.find((i) => board[i] === PLAYER)!;
      next[flip] = AI;
      return { board: next, touchedIndex: flip };
    }
  }

  for (const line of lines) {
    const o = line.filter((i) => board[i] === AI).length;
    const empty = line.filter((i) => board[i] === null).length;
    if (o === winLength - 1 && empty === 1) {
      const next = [...board];
      const fill = line.find((i) => board[i] === null)!;
      next[fill] = AI;
      return { board: next, touchedIndex: fill };
    }
  }

  for (const line of lines) {
    const o = line.filter((i) => board[i] === AI).length;
    if (o >= 1) {
      const next = [...board];
      let touched = line[0];
      for (const i of line) {
        if (next[i] !== AI) touched = i;
        next[i] = AI;
      }
      return { board: next, touchedIndex: touched };
    }
  }

  const next = [...board];
  for (const i of lines[0]) next[i] = AI;
  return { board: next, touchedIndex: lines[0][0] };
}

/**
 * Quiet rewrite only for a finished draw, and only sometimes.
 * A real player three-in-a-row is never stolen.
 */
export function shouldStealDraw(
  board: Board,
  size: number,
  winLength: number,
  luckyFair: boolean,
): boolean {
  if (luckyFair) return false;
  if (getWinnerFor(board, size, winLength) !== 'draw') return false;
  return Math.random() < 0.35;
}
