'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Minimax, PlayerColor, BoardCell } from './Minimax/Minimax';

const ROWS = 6;
const COLS = 6;

const Game = () => {
  const createEmptyBoard = useCallback(() => Array.from({ length: ROWS }, () => Array<BoardCell>(COLS).fill(null)), []);

  const [board, setBoard] = useState<BoardCell[][]>(createEmptyBoard());
  const [player, setPlayer] = useState<PlayerColor>('Red');
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scores, setScores] = useState({ Red: 0, Yellow: 0 });

  // New state for game modes
  const [gameMode, setGameMode] = useState<'2-player' | '1-player'>('2-player');
  const [humanPlayerColor, setHumanPlayerColor] = useState<'Red' | 'Yellow'>('Red');
  const [startingPlayer, setStartingPlayer] = useState<'Red' | 'Yellow'>('Red');
  const [cpuDifficulty, setCpuDifficulty] = useState<'random' | 'ai'>('random');

  const gameBoardRef = useRef<HTMLDivElement>(null);
  const minimax = useRef(new Minimax());

  const handlePlayAgain = useCallback(() => {
    setBoard(createEmptyBoard());
    setPlayer(startingPlayer); // Reset to the chosen starting player
    setWinner(null);
    setIsDraw(false);
  }, [createEmptyBoard, startingPlayer]);

  // Reset game state based on new settings
  useEffect(() => {
    console.log('Settings changed, resetting game.');
    handlePlayAgain(); // Reset board and player when settings change
  }, [gameMode, humanPlayerColor, startingPlayer, cpuDifficulty, handlePlayAgain]);

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

  const checkWin = useCallback((board: BoardCell[][], player: PlayerColor) => {
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
  }, []);

  const handleClick = useCallback((col: number) => {
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
              [player as keyof typeof prevScores]: prevScores[player as keyof typeof prevScores] + 1,
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
  }, [board, player, winner, checkWin, setBoard, setPlayer, setScores, setIsDraw]);

  // CPU's turn logic
  useEffect(() => {
    console.log('CPU useEffect triggered.', { player, gameMode, humanPlayerColor, winner, isDraw, cpuDifficulty });
    const makeCpuMove = () => {
      console.log('makeCpuMove called.', { cpuDifficulty });
      let chosenCol: number;

      if (cpuDifficulty === 'ai') {
        chosenCol = minimax.current.makeMove(board, player);
        console.log('AI chose column:', chosenCol);
      } else {
        const validCols: number[] = [];
        for (let col = 0; col < COLS; col++) {
          if (!board[0][col]) { // Check if column is not full
            validCols.push(col);
          }
        }
        chosenCol = validCols[Math.floor(Math.random() * validCols.length)];
        console.log('Random CPU chose column:', chosenCol);
      }

      handleClick(chosenCol);
    };

    if (gameMode === '1-player' && !winner && !isDraw && player !== humanPlayerColor) {
      console.log('It\'s CPU\'s turn.');
      const cpuMove = setTimeout(() => {
        makeCpuMove();
      }, 500);
      return () => clearTimeout(cpuMove);
    }
  }, [player, gameMode, humanPlayerColor, winner, isDraw, cpuDifficulty, board, handleClick]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
      {/* Hovering token */}
      {!winner && !isDraw && (
        <div
          className={`w-14 h-14 rounded-full ${player === 'Red' ? 'bg-red-500' : 'bg-yellow-500'} absolute top-0 left-0 z-10`}
          style={{ transform: `translate(${mousePos.x - 28}px, ${mousePos.y - 28}px)`, pointerEvents: 'none' }}
        ></div>
      )}

      {/* Scoreboard */}
      <div className="absolute top-4 right-4 bg-gray-700 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Scores</h2>
        <div>Red: {scores.Red}</div>
        <div>Yellow: {scores.Yellow}</div>
      </div>

      {/* Game Settings */}
      <div className="absolute top-4 left-4 bg-gray-700 p-4 rounded-lg flex flex-col gap-2">
        <h2 className="text-xl font-bold mb-2">Game Settings</h2>
        <div>
          <label className="mr-2">Game Mode:</label>
          <input type="radio" id="2-player" name="gameMode" value="2-player" checked={gameMode === '2-player'} onChange={() => setGameMode('2-player')} className="mr-1" />
          <label htmlFor="2-player" className="mr-2">2-Player</label>
          <input type="radio" id="1-player" name="gameMode" value="1-player" checked={gameMode === '1-player'} onChange={() => setGameMode('1-player')} className="mr-1" />
          <label htmlFor="1-player">1-Player (vs CPU)</label>
        </div>

        {gameMode === '1-player' && (
          <>
            <div>
              <label className="mr-2">Your Color:</label>
              <input type="radio" id="human-red" name="humanColor" value="Red" checked={humanPlayerColor === 'Red'} onChange={() => setHumanPlayerColor('Red')} className="mr-1" />
              <label htmlFor="human-red" className="mr-2">Red</label>
              <input type="radio" id="human-yellow" name="humanColor" value="Yellow" checked={humanPlayerColor === 'Yellow'} onChange={() => setHumanPlayerColor('Yellow')} className="mr-1" />
              <label htmlFor="human-yellow">Yellow</label>
            </div>
            <div>
              <label className="mr-2">CPU Difficulty:</label>
              <input type="radio" id="cpu-random" name="cpuDifficulty" value="random" checked={cpuDifficulty === 'random'} onChange={() => setCpuDifficulty('random')} className="mr-1" />
              <label htmlFor="cpu-random" className="mr-2">Random</label>
              <input type="radio" id="cpu-ai" name="cpuDifficulty" value="ai" checked={cpuDifficulty === 'ai'} onChange={() => setCpuDifficulty('ai')} className="mr-1" />
              <label htmlFor="cpu-ai">AI (Coming Soon)</label>
            </div>
          </>
        )}

        <div>
          <label className="mr-2">First Player:</label>
          <input type="radio" id="first-red" name="firstPlayer" value="Red" checked={startingPlayer === 'Red'} onChange={() => setStartingPlayer('Red')} className="mr-1" />
          <label htmlFor="first-red" className="mr-2">Red</label>
          <input type="radio" id="first-yellow" name="firstPlayer" value="Yellow" checked={startingPlayer === 'Yellow'} onChange={() => setStartingPlayer('Yellow')} className="mr-1" />
          <label htmlFor="first-yellow">Yellow</label>
        </div>
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
              role="button" // Added role="button" here
              className={`w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 ${hoveredCol === colIndex ? 'bg-blue-400' : ''}`}
              onClick={() => handleClick(colIndex)}
              onMouseEnter={() => setHoveredCol(colIndex)}
            >
              {cell && (
                <div
                  data-testid="token"
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
          It&apos;s a draw!
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