/**
 * Sanity check: with random human play vs perfect AI, humans never win.
 */
const EMPTY = Array(9).fill(null);
const WIN = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getWinner(board) {
  for (const [a, b, c] of WIN) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every((c) => c !== null)) return 'draw';
  return null;
}

function moves(board) {
  return board.map((c, i) => (c === null ? i : -1)).filter((i) => i !== -1);
}

function minimax(board, isMax, alpha, beta) {
  const w = getWinner(board);
  if (w === 'O') return 10;
  if (w === 'X') return -10;
  if (w === 'draw') return 0;
  const ms = moves(board);
  if (isMax) {
    let best = -Infinity;
    for (const m of ms) {
      const n = [...board];
      n[m] = 'O';
      best = Math.max(best, minimax(n, false, alpha, beta));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of ms) {
    const n = [...board];
    n[m] = 'X';
    best = Math.min(best, minimax(n, true, alpha, beta));
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function getBestMove(board) {
  const ms = moves(board);
  if (!ms.length) return -1;
  if (ms.length === 9) return 4;
  if (ms.length === 8 && board[4] === null) return 4;
  let bestScore = -Infinity;
  let bestMove = ms[0];
  for (const m of ms) {
    const n = [...board];
    n[m] = 'O';
    const s = minimax(n, false, -Infinity, Infinity);
    if (s > bestScore) {
      bestScore = s;
      bestMove = m;
    }
  }
  return bestMove;
}

function play() {
  let board = [...EMPTY];
  while (true) {
    const pm = moves(board);
    if (!pm.length) return 'draw';
    board[pm[Math.floor(Math.random() * pm.length)]] = 'X';
    let w = getWinner(board);
    if (w) return w;
    const am = getBestMove(board);
    if (am < 0 || board[am] !== null) throw new Error('illegal');
    board[am] = 'O';
    w = getWinner(board);
    if (w) return w;
  }
}

let draws = 0;
let ai = 0;
let human = 0;
for (let i = 0; i < 400; i++) {
  const r = play();
  if (r === 'draw') draws += 1;
  else if (r === 'O') ai += 1;
  else human += 1;
}
console.log({ draws, aiWins: ai, humanWins: human });
if (human > 0) {
  console.error('FAIL');
  process.exit(1);
}
console.log('PASS: AI never lost');
