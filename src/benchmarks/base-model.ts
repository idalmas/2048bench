import { Board, Move } from '../app/api/games/types';

// Interface for model configuration
export interface ModelConfig {
  name: string;
  version: string;
  parameters?: Record<string, unknown>;
}

// Interface for move results
export interface MoveResult {
  move: Move;
  reasoning: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

// Interface for game results
export interface GameResult {
  modelInfo: ModelConfig;
  moves: {
    boardState: Board;
    chosenMove: Move;
    reasoning: string;
    scoreDelta: number;
    metadata?: Record<string, unknown>;
  }[];
  finalScore: number;
  maxTile: number;
  totalMoves: number;
  won: boolean;
  duration: number;
  totalTokens?: number;
  estimatedCost?: number;
}

// Abstract base class for AI models
export abstract class BaseAIModel {
  protected config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  // Must be implemented by concrete classes
  abstract getNextMove(
    board: Board,
    score: number,
    moveHistory: Move[]
  ): Promise<MoveResult>;

  // Can be overridden by concrete classes if needed
  getModelInfo(): ModelConfig {
    return this.config;
  }

  // Utility method to format board state
  protected formatBoard(board: Board): string {
    return board.map(row => row.join(' ')).join('\n');
  }
} 