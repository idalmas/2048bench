import { applyMoveToBoard } from '../[id]/move/route';
import { Board, Move } from '../types';

// Helper function to create an empty board
const createEmptyBoard = (): Board => Array(4).fill(0).map(() => Array(4).fill(0));

// Helper function to add a random tile (2 or 4) to the board
function addRandomTile(board: Board): void {
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

// Helper function to check if game is won (has a 2048 tile)
function isGameWon(board: Board): boolean {
  return board.some(row => row.some(cell => cell === 2048));
}

// Helper function to check if game is over (no valid moves)
function isGameOver(board: Board): boolean {
  // Check for empty cells
  if (board.some(row => row.some(cell => cell === 0))) {
    return false;
  }

  // Check for possible merges
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const value = board[i][j];
      if ((j < 3 && board[i][j + 1] === value) ||
          (i < 3 && board[i + 1][j] === value)) {
        return false;
      }
    }
  }

  return true;
}

// Interface for game statistics
interface GameStats {
  moves: number;
  score: number;
  maxTile: number;
  won: boolean;
  duration: number;
}

// Function to simulate a full game
async function playFullGame(
  getNextMove: (board: Board, score: number, moves: Move[]) => Promise<Move>
): Promise<GameStats> {
  const startTime = Date.now();
  let board = createEmptyBoard();
  let score = 0;
  const moves: Move[] = [];
  
  // Add initial two random tiles
  addRandomTile(board);
  addRandomTile(board);

  while (!isGameOver(board) && !isGameWon(board)) {
    // Get next move from AI
    const move = await getNextMove(board, score, moves);
    
    // Apply the move
    const moveResult = applyMoveToBoard(board, move);
    
    // If move was valid and changed the board
    if (moveResult.changed) {
      board = moveResult.board;
      score += moveResult.scoreDelta;
      moves.push(move);
      addRandomTile(board);
    } else {
      // If move was invalid, consider it game over
      break;
    }
  }

  // Calculate max tile
  const maxTile = Math.max(...board.flat());

  return {
    moves: moves.length,
    score,
    maxTile,
    won: isGameWon(board),
    duration: Date.now() - startTime
  };
}

describe('AI Model Tests', () => {
  // Configure test timeouts and number of games
  jest.setTimeout(300000); // 5 minutes
  const NUM_GAMES = 100;

  test('Random Move AI Benchmark', async () => {
    const stats: GameStats[] = [];

    // Random move AI implementation
    const getRandomMove = async (): Promise<Move> => {
      const moves: Move[] = ['up', 'down', 'left', 'right'];
      return moves[Math.floor(Math.random() * moves.length)];
    };

    // Play multiple games
    for (let i = 0; i < NUM_GAMES; i++) {
      const gameStats = await playFullGame(getRandomMove);
      stats.push(gameStats);
    }

    // Calculate aggregate statistics
    const avgScore = stats.reduce((sum, stat) => sum + stat.score, 0) / NUM_GAMES;
    const avgMoves = stats.reduce((sum, stat) => sum + stat.moves, 0) / NUM_GAMES;
    const winRate = stats.filter(stat => stat.won).length / NUM_GAMES;
    const avgMaxTile = stats.reduce((sum, stat) => sum + stat.maxTile, 0) / NUM_GAMES;

    console.log('Random AI Performance:');
    console.log(`Average Score: ${avgScore}`);
    console.log(`Average Moves: ${avgMoves}`);
    console.log(`Win Rate: ${winRate * 100}%`);
    console.log(`Average Max Tile: ${avgMaxTile}`);

    // Basic sanity checks
    expect(avgScore).toBeGreaterThan(0);
    expect(avgMoves).toBeGreaterThan(0);
    expect(avgMaxTile).toBeGreaterThan(2);
  });

  // TODO: Add more AI model tests here
  // Example:
  // test('LLM Model Test', async () => { ... });
  // test('Heuristic AI Test', async () => { ... });
}); 