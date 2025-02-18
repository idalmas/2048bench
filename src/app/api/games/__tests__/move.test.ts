import { applyMoveToBoard } from '../[id]/move/route';
import { Board } from '../types';

describe('2048 Game Logic Tests', () => {
  // Helper function to create an empty board
  const createEmptyBoard = (): Board => Array(4).fill(0).map(() => Array(4).fill(0));

  describe('Basic Movement Tests', () => {
    test('Move up with single tile', () => {
      const board: Board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [2, 0, 0, 0]
      ];
      const expected: Board = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const result = applyMoveToBoard(board, 'up');
      expect(result.board).toEqual(expected);
      expect(result.changed).toBe(true);
      expect(result.scoreDelta).toBe(0);
    });

    test('Move down with single tile', () => {
      const board: Board = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const expected: Board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [2, 0, 0, 0]
      ];
      const result = applyMoveToBoard(board, 'down');
      expect(result.board).toEqual(expected);
      expect(result.changed).toBe(true);
      expect(result.scoreDelta).toBe(0);
    });

    test('Move multiple tiles in same direction', () => {
      const board: Board = [
        [2, 0, 0, 0],
        [4, 0, 0, 0],
        [8, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const expected: Board = [
        [0, 0, 0, 0],
        [2, 0, 0, 0],
        [4, 0, 0, 0],
        [8, 0, 0, 0]
      ];
      const result = applyMoveToBoard(board, 'down');
      expect(result.board).toEqual(expected);
      expect(result.changed).toBe(true);
      expect(result.scoreDelta).toBe(0);
    });
  });

  describe('Merging Tests', () => {
    test('Merge two tiles moving up', () => {
      const board: Board = [
        [0, 0, 0, 0],
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [2, 0, 0, 0]
      ];
      const expected: Board = [
        [4, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const result = applyMoveToBoard(board, 'up');
      expect(result.board).toEqual(expected);
      expect(result.changed).toBe(true);
      expect(result.scoreDelta).toBe(4);
    });

    test('Merge multiple pairs in one move', () => {
      const board: Board = [
        [2, 2, 2, 2],
        [2, 2, 2, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const expected: Board = [
        [4, 4, 4, 4],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const result = applyMoveToBoard(board, 'up');
      expect(result.board).toEqual(expected);
      expect(result.changed).toBe(true);
      expect(result.scoreDelta).toBe(16);
    });

    test('Chain merging is not allowed', () => {
      const board: Board = [
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [2, 0, 0, 0]
      ];
      const expected: Board = [
        [4, 0, 0, 0],
        [4, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const result = applyMoveToBoard(board, 'up');
      expect(result.board).toEqual(expected);
      expect(result.changed).toBe(true);
      expect(result.scoreDelta).toBe(8);
    });

    test('Merge larger numbers correctly', () => {
      const board: Board = [
        [16, 0, 0, 0],
        [16, 0, 0, 0],
        [32, 0, 0, 0],
        [32, 0, 0, 0]
      ];
      const expected: Board = [
        [32, 0, 0, 0],
        [64, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const result = applyMoveToBoard(board, 'up');
      expect(result.board).toEqual(expected);
      expect(result.changed).toBe(true);
      expect(result.scoreDelta).toBe(96); // 32 + 64
    });

    test('Only merge once per move for each tile', () => {
      const board: Board = [
        [4, 0, 0, 0],
        [4, 0, 0, 0],
        [4, 0, 0, 0],
        [4, 0, 0, 0]
      ];
      const expected: Board = [
        [8, 0, 0, 0],
        [8, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const result = applyMoveToBoard(board, 'up');
      expect(result.board).toEqual(expected);
      expect(result.changed).toBe(true);
      expect(result.scoreDelta).toBe(16); // Two 8s created
    });
  });

  describe('Edge Cases', () => {
    test('No valid moves on full board', () => {
      const board: Board = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2]
      ];
      const result = applyMoveToBoard(board, 'up');
      expect(result.board).toEqual(board);
      expect(result.changed).toBe(false);
      expect(result.scoreDelta).toBe(0);
    });

    test('Empty board should not change', () => {
      const board = createEmptyBoard();
      const result = applyMoveToBoard(board, 'up');
      expect(result.board).toEqual(board);
      expect(result.changed).toBe(false);
      expect(result.scoreDelta).toBe(0);
    });

    test('Board with single tile should not merge', () => {
      const board: Board = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const result = applyMoveToBoard(board, 'up');
      expect(result.board).toEqual(board);
      expect(result.changed).toBe(false);
      expect(result.scoreDelta).toBe(0);
    });

    test('Board with different values should not merge', () => {
      const board: Board = [
        [2, 0, 0, 0],
        [4, 0, 0, 0],
        [8, 0, 0, 0],
        [16, 0, 0, 0]
      ];
      const result = applyMoveToBoard(board, 'up');
      expect(result.board).toEqual(board);
      expect(result.changed).toBe(false);
      expect(result.scoreDelta).toBe(0);
    });
  });

  describe('Direction-specific Tests', () => {
    test('Left move should merge towards left edge', () => {
      const board: Board = [
        [0, 2, 0, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const expected: Board = [
        [4, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const result = applyMoveToBoard(board, 'left');
      expect(result.board).toEqual(expected);
      expect(result.changed).toBe(true);
      expect(result.scoreDelta).toBe(4);
    });

    test('Right move should merge towards right edge', () => {
      const board: Board = [
        [2, 0, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const expected: Board = [
        [0, 0, 0, 4],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const result = applyMoveToBoard(board, 'right');
      expect(result.board).toEqual(expected);
      expect(result.changed).toBe(true);
      expect(result.scoreDelta).toBe(4);
    });
  });

  describe('Score Calculation Tests', () => {
    test('Score should be zero when no merges occur', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const result = applyMoveToBoard(board, 'up');
      expect(result.scoreDelta).toBe(0);
    });
  });
}); 