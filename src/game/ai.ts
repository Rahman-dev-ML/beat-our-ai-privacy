import {
  AI,
  Board,
  PLAYER,
  availableMoves,
  getWinnerFor,
} from './logic';

export type AiOptions = {
  size: number;
  winLength: number;
  /** Lucky / nervous games: AI plays soft so you can actually win. */
  soft?: boolean;
  /** Chance to miss a non-urgent move even when playing sharp. */
  slip?: number;
};

function scoreTerminal(
  winner: 'X' | 'O' | 'draw' | null,
  depth: number,
): number | null {
  if (winner === AI) return 100 - depth;
  if (winner === PLAYER) return depth - 100;
  if (winner === 'draw') return 0;
  return null;
}

function heuristic(board: Board, size: number, winLength: number): number {
  // Light pressure toward center + completed threats.
  const center = (size * size) / 2;
  let score = 0;
  board.forEach((c, i) => {
    if (!c) return;
    const dist = Math.abs(i - center);
    const w = Math.max(0, 4 - dist * 0.3);
    score += c === AI ? w : -w;
  });
  void winLength;
  return score;
}

function minimax(
  board: Board,
  size: number,
  winLength: number,
  isMax: boolean,
  depth: number,
  maxDepth: number,
  alpha: number,
  beta: number,
): number {
  const winner = getWinnerFor(board, size, winLength);
  const terminal = scoreTerminal(winner, depth);
  if (terminal !== null) return terminal;
  if (depth >= maxDepth) return heuristic(board, size, winLength);

  const moves = availableMoves(board);
  if (isMax) {
    let best = -Infinity;
    for (const m of moves) {
      const next = [...board];
      next[m] = AI;
      best = Math.max(
        best,
        minimax(next, size, winLength, false, depth + 1, maxDepth, alpha, beta),
      );
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const m of moves) {
    const next = [...board];
    next[m] = PLAYER;
    best = Math.min(
      best,
      minimax(next, size, winLength, true, depth + 1, maxDepth, alpha, beta),
    );
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function depthBudget(size: number, empties: number): number {
  if (size <= 3) return 9;
  if (size === 4) return empties > 10 ? 4 : 5;
  return empties > 16 ? 3 : 4;
}

/** Perfect / strong AI (or soft for lucky rounds). */
export function getBestMove(board: Board, opts: AiOptions): number {
  const { size, winLength, soft = false, slip = 0 } = opts;
  const moves = availableMoves(board);
  if (!moves.length) return -1;

  const safe = moves.filter((m) => {
    const next = [...board];
    next[m] = AI;
    return getWinnerFor(next, size, winLength) !== PLAYER;
  });
  const pool = safe.length ? safe : moves;

  if (soft) {
    if (Math.random() < 0.4) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
    let best = pool[0];
    let bestScore = -Infinity;
    for (const m of pool) {
      const next = [...board];
      next[m] = AI;
      const s = minimax(next, size, winLength, false, 0, 2, -Infinity, Infinity);
      if (s > bestScore) {
        bestScore = s;
        best = m;
      }
    }
    return best;
  }

  if (slip > 0 && Math.random() < slip) {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  if (size === 3 && moves.length === 9) return 4;
  if (size === 3 && moves.length === 8 && board[4] === null) return 4;

  const maxDepth = depthBudget(size, moves.length);
  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    const next = [...board];
    next[move] = AI;
    const score = minimax(next, size, winLength, false, 0, maxDepth, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}
