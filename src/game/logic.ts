export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type Board = CellValue[];
export type Winner = Player | 'draw' | null;
export type GameOutcome = 'you' | 'house' | 'draw';

export const PLAYER: Player = 'X';
export const AI: Player = 'O';

export type GameModeId = 'classic' | 'board4' | 'board5' | 'ultimate';

export type GameConfig = {
  size: number;
  winLength: number;
  ultimate: boolean;
};

export const MODE_CONFIG: Record<GameModeId, GameConfig & { label: string; blurb: string }> = {
  classic: {
    label: 'Classic 3×3',
    blurb: 'Tight board. One slip and the crowd gasps.',
    size: 3,
    winLength: 3,
    ultimate: false,
  },
  board4: {
    label: '4×4',
    blurb: 'Get 4 in a row. More room for a trap.',
    size: 4,
    winLength: 4,
    ultimate: false,
  },
  board5: {
    label: '5×5',
    blurb: 'Get 5 in a row. Longer, meaner, louder.',
    size: 5,
    winLength: 5,
    ultimate: false,
  },
  ultimate: {
    label: 'Ultimate',
    blurb: 'Nine boards. One destiny.',
    size: 3,
    winLength: 3,
    ultimate: true,
  },
};

export function emptyBoard(size: number): Board {
  return Array(size * size).fill(null);
}

/** All contiguous win lines for an N×N board needing K in a row. */
export function buildWinLines(size: number, winLength: number): number[][] {
  const lines: number[][] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const line: number[] = [];
      for (let k = 0; k < winLength; k++) line.push(r * size + (c + k));
      lines.push(line);
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - winLength; r++) {
      const line: number[] = [];
      for (let k = 0; k < winLength; k++) line.push((r + k) * size + c);
      lines.push(line);
    }
  }
  for (let r = 0; r <= size - winLength; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const line: number[] = [];
      for (let k = 0; k < winLength; k++) line.push((r + k) * size + (c + k));
      lines.push(line);
    }
  }
  for (let r = 0; r <= size - winLength; r++) {
    for (let c = winLength - 1; c < size; c++) {
      const line: number[] = [];
      for (let k = 0; k < winLength; k++) line.push((r + k) * size + (c - k));
      lines.push(line);
    }
  }
  return lines;
}

export function getWinnerFor(board: Board, size: number, winLength: number): Winner {
  const lines = buildWinLines(size, winLength);
  for (const line of lines) {
    const first = board[line[0]];
    if (first && line.every((i) => board[i] === first)) return first;
  }
  if (board.every((cell) => cell !== null)) return 'draw';
  return null;
}

/** True when `player` can finish a line on the next move. */
export function isOneAway(
  board: Board,
  size: number,
  winLength: number,
  player: Player,
): boolean {
  for (const line of buildWinLines(size, winLength)) {
    let mine = 0;
    let empty = 0;
    for (const i of line) {
      if (board[i] === player) mine += 1;
      else if (board[i] === null) empty += 1;
    }
    if (mine === winLength - 1 && empty === 1) return true;
  }
  return false;
}

export function getWinningLineFor(
  board: Board,
  size: number,
  winLength: number,
): number[] | null {
  const lines = buildWinLines(size, winLength);
  for (const line of lines) {
    const first = board[line[0]];
    if (first && line.every((i) => board[i] === first)) return line;
  }
  return null;
}

export function availableMoves(board: Board): number[] {
  return board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((index) => index !== -1);
}

// Back-compat helpers for 3×3 classic
export const WIN_LINES = buildWinLines(3, 3);
export const EMPTY_BOARD = emptyBoard(3);

export function getWinner(board: Board): Winner {
  return getWinnerFor(board, 3, 3);
}

export function getWinningLine(board: Board): number[] | null {
  return getWinningLineFor(board, 3, 3);
}
