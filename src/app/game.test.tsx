import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Game from './game';
import { Minimax } from './Minimax/Minimax';

// Mock the Minimax module
jest.mock('./Minimax/Minimax', () => {
  return {
    Minimax: jest.fn().mockImplementation(() => {
      return {
        makeMove: jest.fn((board) => {
          // Default mock implementation: return a random valid column
          const COLS = 6;
          const validCols: number[] = [];
          for (let col = 0; col < COLS; col++) {
            if (!board[0][col]) {
              validCols.push(col);
            }
          }
          return validCols[Math.floor(Math.random() * validCols.length)];
        }),
      };
    }),
  };
});

describe('Game Component', () => {
  let mockMinimaxMakeMove: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    // Render the component first
    render(<Game />);
    // Get the mock instance after rendering
    mockMinimaxMakeMove = (Minimax as jest.Mock).mock.results[0].value.makeMove;
    mockMinimaxMakeMove.mockClear();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders game settings and defaults to 2-player mode', () => {
    expect(screen.getByLabelText('2-Player')).toBeChecked();
    expect(screen.getByLabelText('1-Player (vs CPU)')).not.toBeChecked();
    expect(screen.queryByText('Your Color:')).not.toBeInTheDocument();
    expect(screen.queryByText('CPU Difficulty:')).not.toBeInTheDocument();
  });

  it('shows 1-player options when 1-player mode is selected', () => {
    act(() => {
      fireEvent.click(screen.getByLabelText('1-Player (vs CPU)'));
    });
    expect(screen.getByLabelText('1-Player (vs CPU)')).toBeChecked();
    expect(screen.getByText('Your Color:')).toBeInTheDocument();
    expect(screen.getByText('CPU Difficulty:')).toBeInTheDocument();
  });

  it('allows changing human player color', () => {
    act(() => {
      fireEvent.click(screen.getByLabelText('1-Player (vs CPU)'));
    });
    act(() => {
      fireEvent.click(screen.getByLabelText('Yellow', { selector: 'input#human-yellow' }));
    });
    expect(screen.getByLabelText('Yellow', { selector: 'input#human-yellow' })).toBeChecked();
    expect(screen.getByLabelText('Red', { selector: 'input#human-red' })).not.toBeChecked();
  });

  it('allows changing starting player', () => {
    act(() => {
      fireEvent.click(screen.getByLabelText('Yellow', { selector: 'input#first-yellow' }));
    });
    expect(screen.getByLabelText('Yellow', { selector: 'input#first-yellow' })).toBeChecked();
    expect(screen.getByLabelText('Red', { selector: 'input#first-red' })).not.toBeChecked();
  });

  it('CPU makes a random move in 1-player mode when it\'s its turn and difficulty is random', async () => {
    act(() => {
      fireEvent.click(screen.getByLabelText('1-Player (vs CPU)'));
    });
    act(() => {
      fireEvent.click(screen.getByLabelText('Yellow', { selector: 'input#human-yellow' })); // Human is Yellow, CPU is Red
    });
    act(() => {
      fireEvent.click(screen.getByLabelText('Random', { selector: 'input#cpu-random' }));
    });

    // Red (CPU) should make the first move
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Check if a token has been dropped (e.g., by checking if the board is no longer empty)
    expect(screen.queryAllByTestId('token').length).toBeGreaterThan(0);
    expect(mockMinimaxMakeMove).not.toHaveBeenCalled(); // Minimax should not be called for random difficulty
  });

  it('CPU makes an AI move in 1-player mode when it\'s its turn and difficulty is AI', async () => {
    // Set game mode and CPU difficulty first
    act(() => {
      fireEvent.click(screen.getByLabelText('1-Player (vs CPU)'));
    });

    await act(async () => { // Use await act here to ensure state propagation
      fireEvent.click(screen.getByLabelText('AI (Coming Soon)', { selector: 'input#cpu-ai' }));
    });

    // Mock Minimax to return a specific winning move (e.g., column 3)
    mockMinimaxMakeMove.mockReturnValue(3);

    // Now, set human player color to trigger CPU\'s turn
    act(() => {
      fireEvent.click(screen.getByLabelText('Yellow', { selector: 'input#human-yellow' })); // Human is Yellow, CPU is Red
    });

    // Red (CPU) should make the first move
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Verify Minimax was called and the token was placed in the expected column
    expect(mockMinimaxMakeMove).toHaveBeenCalledTimes(1);
    // Check if the token is in the expected column (column 3, bottom row)
    const boardCells = screen.getAllByRole('button');
    // Find the cell in column 3, bottom row
    const targetCellIndex = (ROWS - 1) * COLS + 3; // Assuming 0-indexed rows and columns
    expect(boardCells[targetCellIndex].querySelector('.w-14.h-14.rounded-full')).toBeInTheDocument();
  });

  it('game state resets when settings change', () => {
    // Make a move
    act(() => {
      fireEvent.click(screen.getAllByRole('button')[0]); // Click first column
    });
    // Check if any token is present on the board
    expect(screen.queryAllByTestId('token').length).toBeGreaterThan(0);

    // Change game mode
    act(() => {
      fireEvent.click(screen.getByLabelText('1-Player (vs CPU)'));
    });

    // Expect board to be empty again
    expect(screen.queryByText('Red wins!')).not.toBeInTheDocument();
    expect(screen.queryByText('Yellow wins!')).not.toBeInTheDocument();
    expect(screen.queryByText('It\'s a draw!')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('token').length).toBe(0);
  });
});