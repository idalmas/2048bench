import { GameState, Board, CreateGameResponse } from './types';
import crypto from 'crypto';
import { games } from './store';

/**
 * Creates an empty 4x4 board and adds two random '2' tiles
 * Input: None
 * Output: Board (4x4 array of numbers)
 */
function initializeBoard(): Board {
    // Create empty 4x4 board
    const board: Board = Array(4).fill(0).map(() => Array(4).fill(0));
    
    // Add two random '2' tiles
    addRandomTile(board);
    addRandomTile(board);
    
    return board;
}

/**
 * Adds a '2' tile to a random empty cell
 * Input: board - The current game board
 * Output: void - Modifies board in place
 */
function addRandomTile(board: Board): void {
    // Get all empty cells
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                emptyCells.push([i, j]);
            }
        }
    }
    
    // Pick random empty cell
    if (emptyCells.length > 0) {
        const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
}

/**
 * Creates a new game
 * Input: HTTP POST request
 * Output: JSON response with new game state
 */
export async function POST() {
    // Generate unique ID for the game
    const gameId = crypto.randomUUID();
    
    // Create initial game state
    const newGame: GameState = {
        id: gameId,
        board: initializeBoard(),
        score: 0,
        moves: [],
        isGameOver: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Store in memory
    games.set(gameId, newGame);
    
    // Return new game info
    const response: CreateGameResponse = {
        gameId: gameId,
        initialState: newGame
    };
    
    return Response.json(response);
}

/**
 * Lists all active games
 * Input: HTTP GET request
 * Output: JSON response with array of all games
 */
export async function GET() {
    // Convert Map to array and return all games
    return Response.json({
        games: Array.from(games.values())
    });
}