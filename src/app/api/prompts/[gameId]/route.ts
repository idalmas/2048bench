import { Move } from '../../games/types';
import { PromptResponse } from '../types';
import { games } from '../../games/store';
import { applyMoveToBoard } from '../../games/utils';

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const gameId = params.gameId;
  const game = games.get(gameId);

  if (!game) {
    return Response.json({ error: 'Game not found' }, { status: 404 });
  }

  const prompt = `You are playing 2048. Here are the rules:
1. Tiles with the same number merge when they collide
2. When 2 tiles merge, their values add together (2+2=4, 4+4=8, etc.)
3. Each move slides all tiles as far as possible in that direction
4. After each move, a new '2' tile appears in a random empty space
5. The goal is to create a tile with the number 2048

Current board state:
${formatBoard(game.board)}

Score: ${game.score}
Previous moves: ${game.moves.join(', ') || 'None'}

Think through your next move and explain your reasoning.
End your response with "MOVE: <direction>" where direction is one of: up, down, left, right`;

  const response: PromptResponse = {
    gameId,
    prompt,
    validMoves: getValidMoves(game.board)
  };

  return Response.json(response);
}

/**
 * Converts the 2D board array into a string representation
 * Input: 4x4 number array representing the board
 * Output: String with board state, one row per line
 */
function formatBoard(board: number[][]): string {
  return board.map(row => row.join(' ')).join('\n');
}

/**
 * Determines which moves are valid in the current board state
 * Input: Current board state as 4x4 number array
 * Output: Array of valid moves (up/down/left/right)
 */
function getValidMoves(board: number[][]): Move[] {
  const moves: Move[] = [];
  
  // Try each direction and see if it changes the board
  ['up', 'down', 'left', 'right'].forEach((move) => {
    const testBoard = JSON.parse(JSON.stringify(board)); // Deep copy
    if (applyMoveToBoard(testBoard, move as Move).changed) {
      moves.push(move as Move);
    }
  });

  return moves;
}