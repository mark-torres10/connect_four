"use client";

import React, { useState } from 'react';

const ROWS = 6;
const COLS = 6;

const Game = () => {
  const createEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  const [board, setBoard] = useState(createEmptyBoard());
  const [player, setPlayer] = useState('Red');
  const [winner, setWinner] = useState<string | null>(null);
  const [isDraw, setIsDraw] = useState(false);

  const handleClick = (col: number) => {
    if (winner || board[0][col]) return;

    const newBoard = board.map(row => [...row]);
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = player;
        setBoard(newBoard);
        if (checkWin(newBoard, player)) {
          setWinner(player);
        } else if (newBoard.every(row => row.every(cell => cell))) {
          setIsDraw(true);
        } else {
          setPlayer(player === 'Red' ? 'Yellow' : 'Red');
        }
        return;
      }
    }
  };

  const checkWin = (board: any[][], player: string) => {
    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (board[row][col] === player && board[row][col + 1] === player && board[row][col + 2] === player && board[row][col + 3] === player) {
          return true;
        }
      }
    }

    // Check vertical
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col] === player && board[row + 1][col] === player && board[row + 2][col] === player && board[row + 3][col] === player) {
          return true;
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (board[row][col] === player && board[row + 1][col + 1] === player && board[row + 2][col + 2] === player && board[row + 3][col + 3] === player) {
          return true;
        }
      }
    }

    // Check diagonal (up-right)
    for (let row = 3; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (board[row][col] === player && board[row - 1][col + 1] === player && board[row - 2][col + 2] === player && board[row - 3][col + 3] === player) {
          return true;
        }
      }
    }

    return false;
  };

  const handlePlayAgain = () => {
    setBoard(createEmptyBoard());
    setPlayer('Red');
    setWinner(null);
    setIsDraw(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
      <h1 className="text-4xl font-bold mb-4">Connect Four</h1>
      <div className="grid grid-cols-6 gap-2 bg-blue-500 p-2 rounded-lg">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => handleClick(colIndex)}
            >
              {cell && (
                <div
                  className={`w-14 h-14 rounded-full ${cell === 'Red' ? 'bg-red-500' : 'bg-yellow-500'}`}
                ></div>
              )}
            </div>
          ))
        )}
      </div>
      {winner && (
        <div className="text-2xl mt-4">
          {winner} wins!
        </div>
      )}
      {isDraw && (
        <div className="text-2xl mt-4">
          It's a draw!
        </div>
      )}
      {(winner || isDraw) && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={handlePlayAgain}
        >
          Play Again
        </button>
      )}
    </div>
  );
};

export default Game;