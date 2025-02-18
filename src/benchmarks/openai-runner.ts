import OpenAI from 'openai';
import { Board, Move } from '../app/api/games/types';
import { applyMoveToBoard } from '../app/api/games/[id]/move/route';
import { MoveValidation } from '../app/api/prompts/types';

// Configuration
const OPENAI_CONFIG = {
  model: 'gpt-3.5-turbo',
  maxTokens: 150,
  temperature: 0.2,
} as const;

interface GameResult {
  moves: {
    boardState: Board;
    chosenMove: Move;
    reasoning: string;
    scoreDelta: number;
  }[];
  finalScore: number;
  maxTile: number;
  totalMoves: number;
  won: boolean;
}

export class OpenAIRunner {
  private openai: OpenAI;
  
  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  private formatBoard(board: Board): string {
    return board.map(row => row.join(' ')).join('\n');
  }

  private createGamePrompt(board: Board, score: number, moveHistory: Move[]): string {
    return `You are playing 2048. Here are the rules:
1. Tiles with the same number merge when they collide
2. When 2 tiles merge, their values add together (2+2=4, 4+4=8, etc.)
3. Each move slides all tiles as far as possible in that direction
4. After each move, a new '2' tile appears in a random empty space
5. The goal is to create a tile with the number 2048

Current board state:
${this.formatBoard(board)}

Score: ${score}
Previous moves: ${moveHistory.length > 0 ? moveHistory.join(', ') : 'None'}

Think through your next move and explain your reasoning.
End your response with "MOVE: <direction>" where direction is one of: up, down, left, right`;
  }

  private validateLLMResponse(response: { reasoning: string }): MoveValidation {
    if (typeof response.reasoning !== 'string') {
      return { isValid: false, error: 'Missing reasoning' };
    }

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

  private async getNextMove(board: Board, score: number, moveHistory: Move[]): Promise<{ move: Move; reasoning: string }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [
          { 
            role: 'system', 
            content: 'You are an AI playing 2048. Analyze the board and explain your move choice.'
          },
          { 
            role: 'user', 
            content: this.createGamePrompt(board, score, moveHistory)
          }
        ],
        max_tokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature,
      });

      const reasoning = response.choices[0]?.message?.content || '';
      const validation = this.validateLLMResponse({ reasoning });

      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      return {
        move: validation.parsedMove!,
        reasoning: validation.parsedReasoning!
      };
    } catch (error) {
      console.error('Error getting move from OpenAI:', error);
      // Fallback to a random move if API fails
      const moves: Move[] = ['up', 'down', 'left', 'right'];
      return {
        move: moves[Math.floor(Math.random() * moves.length)],
        reasoning: 'API Error - Fallback to random move'
      };
    }
  }

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
    // Try all moves and see if any change the board
    const moves: Move[] = ['up', 'down', 'left', 'right'];
    return !moves.some(move => applyMoveToBoard(board, move).changed);
  }

  async runGame(): Promise<GameResult> {
    let board = this.createEmptyBoard();
    let score = 0;
    const moves: GameResult['moves'] = [];
    const moveHistory: Move[] = [];

    // Add initial two random tiles
    this.addRandomTile(board);
    this.addRandomTile(board);

    // Print initial board
    console.log('\nInitial board:');
    console.log(this.formatBoard(board));

    while (!this.isGameOver(board) && !this.isGameWon(board)) {
      // Get next move
      const { move, reasoning } = await this.getNextMove(board, score, moveHistory);
      const moveResult = applyMoveToBoard(board, move);
      
      if (moveResult.changed) {
        moves.push({
          boardState: JSON.parse(JSON.stringify(board)),
          chosenMove: move,
          reasoning,
          scoreDelta: moveResult.scoreDelta
        });

        board = moveResult.board;
        score += moveResult.scoreDelta;
        moveHistory.push(move);
        this.addRandomTile(board);

        // Print move and new board state
        console.log(`\nMove ${moves.length}: ${move}`);
        console.log('Reasoning:', reasoning);
        console.log(this.formatBoard(board));
        console.log(`Score: ${score}`);
      } else {
        console.log(`Invalid move: ${move}`);
        break;
      }
    }

    return {
      moves,
      finalScore: score,
      maxTile: Math.max(...board.flat()),
      totalMoves: moves.length,
      won: this.isGameWon(board)
    };
  }

  async runBenchmark(numGames: number): Promise<GameResult[]> {
    const results: GameResult[] = [];
    
    for (let i = 0; i < numGames; i++) {
      console.log(`\n=== Starting game ${i + 1}/${numGames} ===`);
      const result = await this.runGame();
      results.push(result);
      
      // Log summary after each game
      console.log('\nGame Summary:');
      console.log(`Score: ${result.finalScore}`);
      console.log(`Moves: ${result.totalMoves}`);
      console.log(`Max Tile: ${result.maxTile}`);
      console.log(`Won: ${result.won}`);
      console.log('===================');
    }

    return results;
  }
} 