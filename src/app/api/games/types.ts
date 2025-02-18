// Represents a single cell in the 2048 board
// Can only be 0 (empty) or powers of 2 up to 2048
export type BoardCell = 0 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;

// The game board is a 4x4 grid of BoardCells
export type Board = BoardCell[][];

// Valid moves a player can make
export type Move = 'up' | 'down' | 'left' | 'right';

// The complete state of a game at any point
export interface GameState {
    id: string;           // Unique identifier for the game
    board: Board;         // Current board state
    score: number;        // Current score
    moves: Move[];        // History of all moves made
    isGameOver: boolean;  // Whether the game is finished
    createdAt: string;    // When the game was created
    updatedAt: string;    // When the game was last updated
}

// What the API returns when creating a new game
export interface CreateGameResponse {
    gameId: string;       // ID of the new game
    initialState: GameState;  // Initial game state
}

// Result of applying a move
export interface MoveResult {
    board: Board;
    scoreDelta: number;
    changed: boolean;
}
