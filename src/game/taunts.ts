import { Winner } from './logic';

const pick = <T,>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

export const COPY = {
  brand: 'BEAT OUR AI',
  tagline: 'It slips. You might actually win.',
  thinking: 'AI is thinking…',
};

export const INTRO_LINES = [
  'Welcome to the arena. Spoiler: the AI brought homework.',
  'Tic Tac Toe, but the house always wins.',
  'Think you can win? Adorable.',
  'Challenge accepted. Hope declined.',
];

export const IDLE_TAUNTS = [
  'Take your time. We scheduled eternity.',
  'Corner? Center? Bold of you to have a plan.',
  'The AI already saw that move. Twice.',
  'Plot twist: there is no plot twist. You still lose.',
  'X marks the spot… of your upcoming L.',
  'Confidence looks cute on you. Temporary, but cute.',
  'Hint: there isn’t one.',
  'We believe in you. The AI does not.',
];

export const AFTER_PLAYER_MOVE = [
  'Interesting…',
  'Noted.',
  'You call that a strategy?',
  'Bold move.',
  'Calculating…',
];

export const AFTER_AI_MOVE = [
  'Blocked.',
  'That was free.',
  'Your move.',
  'Still going?',
  'Hmm.',
];

export const THINKING_LINES = [
  'AI is thinking…',
  'Crunching numbers…',
  'Consulting the void…',
];

export const CLIFFHANGER = [
  'One square from glory. The room just went quiet.',
  'Don’t blink. This is the moment.',
  'Heartbeat check. You are THIS close.',
  'The AI sees it. So does everyone else.',
];

export const CLOSE_CALL = [
  'Blocked. Barely. That one stung.',
  'Saved at the last square. Breathe.',
  'Too close. The AI did not like that.',
  'Crowd gasp. Then a block.',
];

export const DRAW_LINES = [
  'Dead heat. Nobody gets the crown.',
  'Stalemate. The tension just… hangs.',
  'Full board. No winner. Rematch energy.',
];

export const CAUGHT_LINES = [
  '…Fine. You saw that.',
  'Caught. Noted in the incident log.',
  'Snitch. Still not a win.',
];

export const PLAYER_WIN_LINES = [
  'Wait — you won?! Impossible. Congrats anyway.',
  'A genuine W. Don’t get used to it.',
  'Fine. You earned that one.',
];

export const APPEAL_LINES = [
  'Appeal denied. Try losing quieter.',
  'Committee laughed. Next.',
  'Your appeal has been recycled.',
  'Form incomplete. Also incorrect. Also sad.',
];

export const INCIDENT_EMPTY = 'Nothing suspicious yet. Give it a second.';

export function statusForResult(result: Winner): string {
  if (result === 'O') {
    return pick([
      'GG. The AI remains undefeated.',
      'Outplayed.',
      'Nice try.',
      'Another one.',
      'Better luck next time.',
      'Close. Not close enough.',
    ]);
  }
  if (result === 'X') return pick(PLAYER_WIN_LINES);
  if (result === 'draw') return pick(DRAW_LINES);
  return 'GG. The AI remains undefeated.';
}

export function randomFrom(list: string[]): string {
  return pick(list);
}
