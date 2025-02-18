import { Board, Move } from '../app/api/games/types';
import { applyMoveToBoard } from '../app/api/games/[id]/move/route';
import { BaseAIModel, GameResult } from './base-model';

export class GameRunner {
  private createEmptyBoard(): Board {
    return Array(4).fill(0).map(() => Array(4).fill(0));
  }

  private addRandomTile(board: Board): void {
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
      board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  private isGameWon(board: Board): boolean {
    return board.some(row => row.some(cell => cell === 2048));
  }

  private isGameOver(board: Board): boolean {
    const moves: Move[] = ['up', 'down', 'left', 'right'];
    return !moves.some(move => applyMoveToBoard(board, move).changed);
  }

  async runGame(model: BaseAIModel): Promise<GameResult> {
    let board = this.createEmptyBoard();
    let score = 0;
    const moves: GameResult['moves'] = [];
    const moveHistory: Move[] = [];
    const startTime = Date.now();

    // Add initial two random tiles
    this.addRandomTile(board);
    this.addRandomTile(board);

    console.log('\nInitial board:');
    console.log(board.map(row => row.join(' ')).join('\n'));

    while (!this.isGameOver(board) && !this.isGameWon(board)) {
      const moveResult = await model.getNextMove(board, score, moveHistory);
      const result = applyMoveToBoard(board, moveResult.move);
      
      if (result.changed) {
        moves.push({
          boardState: JSON.parse(JSON.stringify(board)),
          chosenMove: moveResult.move,
          reasoning: moveResult.reasoning,
          scoreDelta: result.scoreDelta,
          metadata: moveResult.metadata
        });

        board = result.board;
        score += result.scoreDelta;
        moveHistory.push(moveResult.move);
        this.addRandomTile(board);

        console.log(`\nMove ${moves.length}: ${moveResult.move}`);
        console.log('Reasoning:', moveResult.reasoning);
        console.log(board.map(row => row.join(' ')).join('\n'));
        console.log(`Score: ${score}`);
      } else {
        console.log(`Invalid move: ${moveResult.move}`);
        break;
      }
    }

    return {
      modelInfo: model.getModelInfo(),
      moves,
      finalScore: score,
      maxTile: Math.max(...board.flat()),
      totalMoves: moves.length,
      won: this.isGameWon(board),
      duration: Date.now() - startTime,
      totalTokens: moves.reduce((sum, move) => 
        sum + (move.metadata?.tokens?.total || 0), 0),
      estimatedCost: 0 // This would need to be calculated based on the specific model's pricing
    };
  }

  async runBenchmark(model: BaseAIModel, numGames: number): Promise<GameResult[]> {
    const results: GameResult[] = [];
    
    for (let i = 0; i < numGames; i++) {
      console.log(`\n=== Starting game ${i + 1}/${numGames} with ${model.getModelInfo().name} ===`);
      const result = await this.runGame(model);
      results.push(result);
      
      console.log('\nGame Summary:');
      console.log(`Score: ${result.finalScore}`);
      console.log(`Moves: ${result.totalMoves}`);
      console.log(`Max Tile: ${result.maxTile}`);
      console.log(`Won: ${result.won}`);
      console.log(`Duration: ${result.duration}ms`);
      console.log(`Total Tokens: ${result.totalTokens}`);
      console.log('===================');
    }

    return results;
  }
} 