'use client';

import React, { useState, useEffect, useRef } from 'react';

const ROWS = 6;
const COLS = 6;

const Game = () => {
  const createEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  const [board, setBoard] = useState(createEmptyBoard());
  const [player, setPlayer] = useState('Red');
  const [winner, setWinner] = useState<string | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scores, setScores] = useState({ Red: 0, Yellow: 0 });

  const gameBoardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };

    if (!winner && !isDraw) {
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [winner, isDraw]);

  const handleClick = (col: number) => {
    if (winner || board[0][col]) return;

    const newBoard = board.map(row => [...row]);
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = { player, dropped: false };
        setBoard(newBoard);
        // Trigger the drop animation
        setTimeout(() => {
          const finalBoard = newBoard.map(r => [...r]);
          finalBoard[row][col] = { player, dropped: true };
          setBoard(finalBoard);

          if (checkWin(finalBoard, player)) {
            setWinner(player);
            setScores(prevScores => ({
              ...prevScores,
              [player]: prevScores[player as keyof typeof prevScores] + 1,
            }));
          } else if (finalBoard.every(row => row.every(cell => cell))) {
            setIsDraw(true);
          } else {
            setPlayer(player === 'Red' ? 'Yellow' : 'Red');
          }
        }, 50);
        return;
      }
    }
  };

  const checkWin = (board: any[][], player: string) => {
    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (board[row][col]?.player === player && board[row][col + 1]?.player === player && board[row][col + 2]?.player === player && board[row][col + 3]?.player === player) {
          return true;
        }
      }
    }

    // Check vertical
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col]?.player === player && board[row + 1][col]?.player === player && board[row + 2][col]?.player === player && board[row + 3][col]?.player === player) {
          return true;
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (board[row][col]?.player === player && board[row + 1][col + 1]?.player === player && board[row + 2][col + 2]?.player === player && board[row + 3][col + 3]?.player === player) {
          return true;
        }
      }
    }

    // Check diagonal (up-right)
    for (let row = 3; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (board[row][col]?.player === player && board[row - 1][col + 1]?.player === player && board[row - 2][col + 2]?.player === player && board[row - 3][col + 3]?.player === player) {
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
      {!winner && !isDraw && (
        <div
          className={`w-14 h-14 rounded-full ${player === 'Red' ? 'bg-red-500' : 'bg-yellow-500'} absolute top-0 left-0 z-10`}
          style={{ transform: `translate(${mousePos.x - 28}px, ${mousePos.y - 28}px)`, pointerEvents: 'none' }}
        ></div>
      )}
      <div className="absolute top-4 right-4 bg-gray-700 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Scores</h2>
        <div>Red: {scores.Red}</div>
        <div>Yellow: {scores.Yellow}</div>
      </div>
      <h1 className="text-4xl font-bold mb-4">Connect Four</h1>
      <div
        ref={gameBoardRef}
        className="grid grid-cols-6 gap-2 bg-blue-500 p-2 rounded-lg relative"
        onMouseLeave={() => setHoveredCol(null)}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 ${hoveredCol === colIndex ? 'bg-blue-400' : ''}`}
              onClick={() => handleClick(colIndex)}
              onMouseEnter={() => setHoveredCol(colIndex)}
            >
              {cell && (
                <div
                  className={`w-14 h-14 rounded-full ${cell.player === 'Red' ? 'bg-red-500' : 'bg-yellow-500'} transform transition-transform duration-500 ease-in`}
                  style={{ transform: `translateY(${cell.dropped ? '0px' : '-400px'})` }}
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
