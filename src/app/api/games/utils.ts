import { Board, Move, MoveResult } from './types';
import { MoveValidation } from '../prompts/types';

export function validateLLMResponse(response: { reasoning: string }): MoveValidation {
  // Check if response has the expected format
  if (typeof response.reasoning !== 'string') {
    return { isValid: false, error: 'Missing reasoning' };
  }

  // Look for "MOVE: direction" pattern
  const moveMatch = response.reasoning.match(/MOVE:\s*(up|down|left|right)/i);
  if (!moveMatch) {
    return { isValid: false, error: 'No valid move direction found' };
  }

  return {
    isValid: true,
    parsedMove: moveMatch[1].toLowerCase() as Move,
    parsedReasoning: response.reasoning
  };
}

export function applyMoveToBoard(board: Board, move: Move): MoveResult {
  let changed = false;
  let scoreDelta = 0;
  const newBoard = JSON.parse(JSON.stringify(board));

  // Process each line (row or column)
  for (let i = 0; i < 4; i++) {
    // Get the line (row or column)
    const line: number[] = [];
    for (let j = 0; j < 4; j++) {
      if (move === 'up' || move === 'down') {
        line.push(board[j][i]);  // Read column
      } else {
        line.push(board[i][j]);  // Read row
      }
    }

    // Store original for comparison
    const originalLine = [...line];

    // Remove zeros
    const numbers = line.filter(cell => cell !== 0);
    
    // Process merges
    const processed: number[] = [];
    if (move === 'up' || move === 'left') {
      // Process from left to right
      let idx = 0;
      while (idx < numbers.length) {
        if (idx + 1 < numbers.length && numbers[idx] === numbers[idx + 1]) {
          const merged = numbers[idx] * 2;
          processed.push(merged);
          scoreDelta += merged;
          idx += 2;
        } else {
          processed.push(numbers[idx]);
          idx++;
        }
      }
    } else {
      // For right/down moves, process from left to right but place results at the end
      let idx = 0;
      while (idx < numbers.length) {
        if (idx + 1 < numbers.length && numbers[idx] === numbers[idx + 1]) {
          const merged = numbers[idx] * 2;
          processed.push(merged);
          scoreDelta += merged;
          idx += 2;
        } else {
          processed.push(numbers[idx]);
          idx++;
        }
      }
    }

    // Add zeros based on direction
    const finalLine = Array(4).fill(0);
    if (move === 'up' || move === 'left') {
      processed.forEach((val, idx) => {
        finalLine[idx] = val;
      });
    } else {
      processed.forEach((val, idx) => {
        finalLine[3 - (processed.length - 1 - idx)] = val;
      });
    }

    // Write back to board
    for (let j = 0; j < 4; j++) {
      if (move === 'up' || move === 'down') {
        newBoard[j][i] = finalLine[j];
      } else {
        newBoard[i][j] = finalLine[j];
      }
    }

    // Check if line changed
    if (!originalLine.every((val, idx) => val === finalLine[idx])) {
      changed = true;
    }
  }

  return { board: newBoard, changed, scoreDelta };
}

export function addRandomTile(board: Board): void {
  const emptyCells: [number, number][] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) {
        emptyCells.push([i, j]);
      }
    }
  }

  if (emptyCells.length > 0) {
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[row][col] = Math.random() < 0.9 ? 2 : 4;  // 90% chance of 2, 10% chance of 4
  }
}

export function isGameOver(board: Board): boolean {
  // Check for any empty cells
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) return false;
    }
  }

  // Check for any possible merges
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const value = board[i][j];
      // Check right and down neighbors
      if ((j < 3 && board[i][j + 1] === value) ||
          (i < 3 && board[i + 1][j] === value)) {
        return false;
      }
    }
  }

  return true;
} 