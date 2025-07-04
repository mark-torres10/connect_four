export class Minimax {
  private ROWS = 6;
  private COLS = 6;
  private MAX_DEPTH = 4; // Limiting depth for initial testing

  makeMove(board: any[][], player: string): number {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let col = 0; col < this.COLS; col++) {
      const newBoard = this.getNewBoard(board, col, player);
      if (newBoard) {
        const score = this.minimax(newBoard, 0, false, player);
        if (score > bestScore) {
          bestScore = score;
          bestMove = col;
        }
      }
    }
    return bestMove;
  }

  private minimax(board: any[][], depth: number, isMaximizingPlayer: boolean, player: string): number {
    const opponent = player === 'Red' ? 'Yellow' : 'Red';

    if (this.checkWin(board, player)) {
      return 100 - depth; // AI wins
    }
    if (this.checkWin(board, opponent)) {
      return -100 + depth; // Opponent wins
    }
    if (this.isBoardFull(board)) {
      return 0; // Draw
    }

    if (depth === this.MAX_DEPTH) {
      return this.evaluateBoard(board, player); // Evaluate board at max depth
    }

    if (isMaximizingPlayer) {
      let bestScore = -Infinity;
      for (let col = 0; col < this.COLS; col++) {
        const newBoard = this.getNewBoard(board, col, player);
        if (newBoard) {
          const score = this.minimax(newBoard, depth + 1, false, player);
          bestScore = Math.max(bestScore, score);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let col = 0; col < this.COLS; col++) {
        const newBoard = this.getNewBoard(board, col, opponent);
        if (newBoard) {
          const score = this.minimax(newBoard, depth + 1, true, player);
          bestScore = Math.min(bestScore, score);
        }
      }
      return bestScore;
    }
  }

  private getNewBoard(board: any[][], col: number, player: string): any[][] | null {
    const newBoard = board.map(row => [...row]);
    for (let row = this.ROWS - 1; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = { player, dropped: true };
        return newBoard;
      }
    }
    return null; // Column is full
  }

  private checkWin(board: any[][], player: string): boolean {
    // Check horizontal
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS - 3; col++) {
        if (board[row][col]?.player === player && board[row][col + 1]?.player === player && board[row][col + 2]?.player === player && board[row][col + 3]?.player === player) {
          return true;
        }
      }
    }

    // Check vertical
    for (let row = 0; row < this.ROWS - 3; row++) {
      for (let col = 0; col < this.COLS; col++) {
        if (board[row][col]?.player === player && board[row + 1][col]?.player === player && board[row + 2][col]?.player === player && board[row + 3][col]?.player === player) {
          return true;
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row < this.ROWS - 3; row++) {
      for (let col = 0; col < this.COLS - 3; col++) {
        if (board[row][col]?.player === player && board[row + 1][col + 1]?.player === player && board[row + 2][col + 2]?.player === player && board[row + 3][col + 3]?.player === player) {
          return true;
        }
      }
    }

    // Check diagonal (up-right)
    for (let row = 3; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS - 3; col++) {
        if (board[row][col]?.player === player && board[row - 1][col + 1]?.player === player && board[row - 2][col + 2]?.player === player && board[row - 3][col + 3]?.player === player) {
          return true;
        }
      }
    }

    return false;
  }

  private isBoardFull(board: any[][]): boolean {
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        if (board[row][col] === null) {
          return false; // Found an empty cell, board is not full
        }
      }
    }
    return true; // All cells are filled, board is full
  }

  private evaluateBoard(board: any[][], player: string): number {
    let score = 0;
    const opponent = player === 'Red' ? 'Yellow' : 'Red';

    // Prioritize center column
    for (let r = 0; r < this.ROWS; r++) {
      if (board[r][Math.floor(this.COLS / 2)]?.player === player) {
        score += 3;
      }
    }

    // Evaluate horizontal, vertical, and diagonal lines
    score += this.evaluateLines(board, player, opponent);

    return score;
  }

  private evaluateLines(board: any[][], player: string, opponent: string): number {
    let score = 0;

    // Check horizontal
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS - 3; c++) {
        const window = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]];
        score += this.scoreWindow(window, player, opponent);
      }
    }

    // Check vertical
    for (let c = 0; c < this.COLS; c++) {
      for (let r = 0; r < this.ROWS - 3; r++) {
        const window = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
        score += this.scoreWindow(window, player, opponent);
      }
    }

    // Check diagonal (positive slope)
    for (let r = 0; r < this.ROWS - 3; r++) {
      for (let c = 0; c < this.COLS - 3; c++) {
        const window = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
        score += this.scoreWindow(window, player, opponent);
      }
    }

    // Check diagonal (negative slope)
    for (let r = 3; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS - 3; c++) {
        const window = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
        score += this.scoreWindow(window, player, opponent);
      }
    }

    return score;
  }

  private scoreWindow(window: any[], player: string, opponent: string): number {
    let score = 0;
    const playerCount = window.filter(cell => cell?.player === player).length;
    const opponentCount = window.filter(cell => cell?.player === opponent).length;
    const emptyCount = window.filter(cell => cell === null).length;

    if (playerCount === 4) {
      score += 100; // Winning move
    } else if (playerCount === 3 && emptyCount === 1) {
      score += 10; // Three in a row with one empty spot
    } else if (playerCount === 2 && emptyCount === 2) {
      score += 2; // Two in a row with two empty spots
    }

    if (opponentCount === 3 && emptyCount === 1) {
      score -= 80; // Block opponent's winning move
    }

    return score;
  }
}
