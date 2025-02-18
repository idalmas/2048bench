import { Move } from '../games/types';

// The format we expect LLMs to respond in
export interface LLMResponse {
    reasoning: string;     // Their explanation of why they chose this move
    move: Move;           // The actual move they chose (up/down/left/right)
    confidence?: number;   // Optional: how confident they are (0-1)
}

// The structure of our prompt
export interface GamePrompt {
    rules: string;        // The rules explanation
    currentState: {
        board: string;    // Formatted board state as a string
        score: number;
        moveHistory: Move[];
    };
    format: string;       // Instructions on how to format their response
}

// For validating LLM responses
export interface MoveValidation {
    isValid: boolean;
    error?: string;       // If invalid, why?
    parsedMove?: Move;    // If valid, the extracted move
    parsedReasoning?: string;  // The extracted reasoning
}

// What the prompt endpoint returns
export interface PromptResponse {
    gameId: string;
    prompt: string;       // The full formatted prompt text
    validMoves: Move[];   // Which moves are currently valid
}
