import { OpenAIRunner } from './openai-runner';
import fs from 'fs';
import path from 'path';

// Configuration
const NUM_GAMES = 10;  // Start with 10 games as a test
const RESULTS_DIR = path.join(process.cwd(), 'benchmark-results');

async function main() {
  // Ensure we have an API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Please set OPENAI_API_KEY environment variable');
    process.exit(1);
  }

  // Create results directory if it doesn't exist
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }

  // Initialize runner
  const runner = new OpenAIRunner(apiKey);

  // Run benchmark
  console.log(`Starting benchmark with ${NUM_GAMES} games...`);
  const startTime = Date.now();
  
  try {
    const results = await runner.runBenchmark(NUM_GAMES);
    
    // Calculate aggregate statistics
    const totalGames = results.length;
    const wins = results.filter(r => r.won).length;
    const avgScore = results.reduce((sum, r) => sum + r.finalScore, 0) / totalGames;
    const avgMoves = results.reduce((sum, r) => sum + r.totalMoves, 0) / totalGames;
    const avgMaxTile = results.reduce((sum, r) => sum + r.maxTile, 0) / totalGames;
    const totalTokens = results.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalDuration = Date.now() - startTime;

    // Create summary
    const summary = {
      timestamp: new Date().toISOString(),
      config: {
        numGames: NUM_GAMES,
        model: 'gpt-3.5-turbo',
      },
      results: {
        totalGames,
        wins,
        winRate: (wins / totalGames) * 100,
        avgScore,
        avgMoves,
        avgMaxTile,
        totalTokens,
        estimatedCost: (totalTokens / 1000) * 0.002, // $0.002 per 1k tokens
        totalDuration,
        avgGameDuration: totalDuration / totalGames,
      },
      gameDetails: results
    };

    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(RESULTS_DIR, `benchmark-${timestamp}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2));

    // Log summary
    console.log('\nBenchmark Complete!');
    console.log('-------------------');
    console.log(`Games Played: ${totalGames}`);
    console.log(`Win Rate: ${summary.results.winRate.toFixed(2)}%`);
    console.log(`Average Score: ${avgScore.toFixed(2)}`);
    console.log(`Average Moves: ${avgMoves.toFixed(2)}`);
    console.log(`Average Max Tile: ${avgMaxTile.toFixed(2)}`);
    console.log(`Total Tokens: ${totalTokens}`);
    console.log(`Estimated Cost: $${summary.results.estimatedCost.toFixed(4)}`);
    console.log(`Total Duration: ${(totalDuration / 1000 / 60).toFixed(2)} minutes`);
    console.log(`Results saved to: ${resultsPath}`);

  } catch (error) {
    console.error('Benchmark failed:', error);
    process.exit(1);
  }
}

main(); 