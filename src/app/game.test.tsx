import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Game from './game';

describe('Game Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders game settings and defaults to 2-player mode', () => {
    act(() => {
      render(<Game />);
    });
    expect(screen.getByLabelText('2-Player')).toBeChecked();
    expect(screen.getByLabelText('1-Player (vs CPU)')).not.toBeChecked();
    expect(screen.queryByText('Your Color:')).not.toBeInTheDocument();
    expect(screen.queryByText('CPU Difficulty:')).not.toBeInTheDocument();
  });

  it('shows 1-player options when 1-player mode is selected', () => {
    act(() => {
      render(<Game />);
    });
    act(() => {
      fireEvent.click(screen.getByLabelText('1-Player (vs CPU)'));
    });
    expect(screen.getByLabelText('1-Player (vs CPU)')).toBeChecked();
    expect(screen.getByText('Your Color:')).toBeInTheDocument();
    expect(screen.getByText('CPU Difficulty:')).toBeInTheDocument();
  });

  it('allows changing human player color', () => {
    act(() => {
      render(<Game />);
    });
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
      render(<Game />);
    });
    act(() => {
      fireEvent.click(screen.getByLabelText('Yellow', { selector: 'input#first-yellow' }));
    });
    expect(screen.getByLabelText('Yellow', { selector: 'input#first-yellow' })).toBeChecked();
    expect(screen.getByLabelText('Red', { selector: 'input#first-red' })).not.toBeChecked();
  });

  it('CPU makes a move in 1-player mode when it\'s its turn', async () => {
    render(<Game />);
    act(() => {
      fireEvent.click(screen.getByLabelText('1-Player (vs CPU)'));
    });
    act(() => {
      fireEvent.click(screen.getByLabelText('Yellow', { selector: 'input#human-yellow' })); // Human is Yellow, CPU is Red
    });

    // Red (CPU) should make the first move
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Check if a token has been dropped (e.g., by checking if the board is no longer empty)
    expect(screen.queryAllByTestId('token').length).toBeGreaterThan(0);
  });

  it('game state resets when settings change', () => {
    act(() => {
      render(<Game />);
    });
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