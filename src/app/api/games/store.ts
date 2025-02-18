import { GameState } from './types';

// Use global scope to persist data between requests
declare global {
    var gameStore: Map<string, GameState> | undefined;
}

// Initialize the store if it doesn't exist
if (!global.gameStore) {
    global.gameStore = new Map<string, GameState>();
}

// Export the store
export const games = global.gameStore; 