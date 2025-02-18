import { GameState } from '../../types';
import { games } from '../../store';
import { validateLLMResponse, applyMoveToBoard, addRandomTile, isGameOver } from '../../utils';
import { NextRequest, NextResponse } from 'next/server';

// TODO: Fix type issues with Next.js App Router route handler
// Temporarily disabled due to type conflicts with Next.js 14+ route handler signatures
/*
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  console.log('Processing move for game:', id);
  console.log('Current games in store:', Array.from(games.keys()));
  
  const game = games.get(id);
  console.log('Current board state:', game?.board);

  if (!game) {
    console.log('Game not found in store');
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  const body = await request.json();
  console.log('Received move:', body);
  const validation = validateLLMResponse(body);

  if (!validation.isValid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const moveResult = applyMoveToBoard(game.board, validation.parsedMove!);
  console.log('Move result:', {
    changed: moveResult.changed,
    scoreDelta: moveResult.scoreDelta,
    newBoard: moveResult.board
  }
  
  if (moveResult.changed) {
    addRandomTile(moveResult.board);
    console.log('Board after adding random tile:', moveResult.board);
  }

  const newState: GameState = {
    ...game,
    board: moveResult.board,
    score: game.score + moveResult.scoreDelta,
    moves: [...game.moves, validation.parsedMove!],
    updatedAt: new Date().toISOString(),
    isGameOver: isGameOver(moveResult.board)
  };

  games.set(id, newState);
  console.log('Saved new state:', newState);

  return NextResponse.json({
    success: true,
    newState,
    moveResult: {
      move: validation.parsedMove,
      reasoning: validation.parsedReasoning,
      scoreDelta: moveResult.scoreDelta
    }
  });
}
*/

// Temporary simple handler that returns a 501 Not Implemented
export async function POST() {
  return NextResponse.json({ error: "API temporarily disabled" }, { status: 501 });
}