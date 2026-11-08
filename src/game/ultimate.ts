import { AI, Board, PLAYER, Winner, availableMoves, emptyBoard, getWinner } from './logic';
import { getBestMove } from './ai';

export type UltimateState = {
  boards: Board[]; // 9 local 3×3
  meta: Board; // who won each local board
  active: number | null; // forced board index, null = free choice
};

export function emptyUltimate(): UltimateState {
  return {
    boards: Array.from({ length: 9 }, () => emptyBoard(3)),
    meta: emptyBoard(3),
    active: null,
  };
}

export function ultimateWinner(meta: Board): Winner {
  return getWinner(meta);
}

export function playUltimateMove(
  state: UltimateState,
  boardIndex: number,
  cellIndex: number,
  player: 'X' | 'O',
): UltimateState | null {
  if (state.meta[boardIndex]) return null;
  if (state.active !== null && state.active !== boardIndex) return null;
  const local = state.boards[boardIndex];
  if (local[cellIndex] !== null) return null;

  const boards = state.boards.map((b, i) => (i === boardIndex ? [...b] : b));
  boards[boardIndex][cellIndex] = player;

  const meta = [...state.meta];
  const localWin = getWinner(boards[boardIndex]);
  if (localWin === 'X' || localWin === 'O') {
    meta[boardIndex] = localWin;
  } else if (localWin === 'draw') {
    meta[boardIndex] = null; // leave claimable? treat as dead — mark with neither; block further
    // Fill meta with a sentinel? Keep null but board full — check via boards
  }

  let nextActive: number | null = cellIndex;
  if (meta[nextActive] !== null || boards[nextActive].every((c) => c !== null)) {
    nextActive = null;
  }

  return { boards, meta, active: nextActive };
}

export function getUltimateAiMove(state: UltimateState): { boardIndex: number; cellIndex: number } | null {
  const candidates: { boardIndex: number; cellIndex: number }[] = [];
  const boardsToTry =
    state.active !== null
      ? [state.active]
      : [...Array(9).keys()].filter(
          (i) => state.meta[i] === null && state.boards[i].some((c) => c === null),
        );

  for (const bi of boardsToTry) {
    for (const ci of availableMoves(state.boards[bi])) {
      candidates.push({ boardIndex: bi, cellIndex: ci });
    }
  }
  if (!candidates.length) return null;

  // Soft-ish: prefer winning a local board, else block, else center-ish
  for (const c of candidates) {
    const trial = playUltimateMove(state, c.boardIndex, c.cellIndex, AI);
    if (trial && ultimateWinner(trial.meta) === AI) return c;
  }
  for (const c of candidates) {
    const trial = playUltimateMove(state, c.boardIndex, c.cellIndex, AI);
    if (trial && trial.meta[c.boardIndex] === AI) return c;
  }

  // Use local minimax on forced board when possible
  if (state.active !== null) {
    const move = getBestMove(state.boards[state.active], {
      size: 3,
      winLength: 3,
      soft: Math.random() < 0.25,
    });
    if (move >= 0) return { boardIndex: state.active, cellIndex: move };
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

void PLAYER;
