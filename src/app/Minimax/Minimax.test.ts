import { Minimax } from './Minimax';

describe('Minimax', () => {
  let minimax: Minimax;

  beforeEach(() => {
    minimax = new Minimax();
  });

  it('should return the winning move when available', () => {
    const board = [
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      ['Red', 'Red', 'Red', null, null, null],
      ['Yellow', 'Yellow', 'Yellow', null, null, null],
      [null, null, null, null, null, null],
    ];
    const player = 'Red';
    expect(minimax.makeMove(board, player)).toBe(3);
  });

  it('should block the opponent from winning', () => {
    const board = [
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      ['Yellow', 'Yellow', 'Yellow', null, null, null],
      ['Red', 'Red', null, null, null, null],
      [null, null, null, null, null, null],
    ];
    const player = 'Red';
    expect(minimax.makeMove(board, player)).toBe(3);
  });
});
