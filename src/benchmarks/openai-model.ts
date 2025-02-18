import OpenAI from 'openai';
import { Board, Move } from '../app/api/games/types';
import { MoveValidation } from '../app/api/prompts/types';
import { BaseAIModel, ModelConfig, MoveResult } from './base-model';

interface OpenAIConfig extends ModelConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export class OpenAIModel extends BaseAIModel {
  private openai: OpenAI;
  protected config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    super({
      name: 'OpenAI',
      version: config.model,
      parameters: {
        maxTokens: config.maxTokens,
        temperature: config.temperature
      }
    });
    this.config = config;
    this.openai = new OpenAI({ apiKey: config.apiKey });
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
Previous moves: ${moveHistory.length > 0 ? moveHistory.slice(-3).join(', ') : 'None'}

Think through your next move and explain your reasoning.
End your response with "MOVE: <direction>" where direction is one of: up, down, left, right`;
  }

  private validateLLMResponse(response: string): MoveValidation {
    if (!response) {
      return { isValid: false, error: 'Empty response' };
    }

    const moveMatch = response.match(/MOVE:\s*(up|down|left|right)/i);
    if (!moveMatch) {
      return { isValid: false, error: 'No valid move direction found' };
    }

    return {
      isValid: true,
      parsedMove: moveMatch[1].toLowerCase() as Move,
      parsedReasoning: response
    };
  }

  async getNextMove(board: Board, score: number, moveHistory: Move[]): Promise<MoveResult> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
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
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const reasoning = response.choices[0]?.message?.content || '';
      const validation = this.validateLLMResponse(reasoning);

      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      return {
        move: validation.parsedMove!,
        reasoning: validation.parsedReasoning!,
        metadata: {
          tokens: {
            prompt: response.usage?.prompt_tokens,
            completion: response.usage?.completion_tokens,
            total: response.usage?.total_tokens
          }
        }
      };
    } catch (error) {
      console.error('Error getting move from OpenAI:', error);
      // Fallback to a random move if API fails
      const moves: Move[] = ['up', 'down', 'left', 'right'];
      return {
        move: moves[Math.floor(Math.random() * moves.length)],
        reasoning: 'API Error - Fallback to random move',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
} 