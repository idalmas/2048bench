import { GameRunner } from './game-runner';
import { OpenAIModel } from './openai-model';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get model filter from command line arguments
const modelFilter = process.argv[2];

// Configuration for different models
const MODELS = [
  {
    name: 'GPT-3.5-Turbo',
    config: {
      name: 'OpenAI',
      version: 'gpt-3.5-turbo',
      model: 'gpt-3.5-turbo',
      maxTokens: 150,
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY || ''
    }
  },
  {
    name: 'GPT-4',
    config: {
      name: 'OpenAI',
      version: 'gpt-4',
      model: 'gpt-4',
      maxTokens: 150,
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY || ''
    }
  },
  {
    name: 'GPT-4O',
    config: {
      name: 'OpenAI',
      version: 'gpt-4o',
      model: 'gpt-4o',
      maxTokens: 150,
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY || ''
    }
  },
  {
    name: 'GPT-4-0314',
    config: {
      name: 'OpenAI',
      version: 'gpt-4-0314',
      model: 'gpt-4-0314',
      maxTokens: 150,
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY || ''
    }
  },
  {
    name: 'GPT-4-0613',
    config: {
      name: 'OpenAI',
      version: 'gpt-4-0613',
      model: 'gpt-4-0613',
      maxTokens: 150,
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY || ''
    }
  },
  {
    name: 'GPT-4-Turbo',
    config: {
      name: 'OpenAI',
      version: 'gpt-4-0125-preview',
      model: 'gpt-4-0125-preview',
      maxTokens: 150,
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY || ''
    }
  },
  {
    name: 'GPT-4-Turbo-1106',
    config: {
      name: 'OpenAI',
      version: 'gpt-4-1106-preview',
      model: 'gpt-4-1106-preview',
      maxTokens: 150,
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY || ''
    }
  }
  // Add more models here as needed
];

async function main() {
  // Ensure we have an API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  const runner = new GameRunner();
  const resultsDir = path.join(__dirname, '../../benchmark-results');

  // Create results directory if it doesn't exist
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Filter models if specified
  const modelsToRun = modelFilter 
    ? MODELS.filter(m => m.name.toLowerCase() === modelFilter.toLowerCase())
    : MODELS;

  if (modelsToRun.length === 0) {
    console.error(`No models found matching: ${modelFilter}`);
    console.log('Available models:', MODELS.map(m => m.name).join(', '));
    process.exit(1);
  }

  // Run benchmark for each model
  for (const modelConfig of modelsToRun) {
    console.log(`\n=== Running benchmark for ${modelConfig.name} ===`);
    
    const model = new OpenAIModel(modelConfig.config);
    const results = await runner.runBenchmark(model, 5); // Run 5 games per model

    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${modelConfig.name.toLowerCase()}-${timestamp}.json`;
    const filepath = path.join(resultsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
    console.log(`Results saved to ${filepath}`);

    // Calculate and display aggregate statistics
    const stats = {
      averageScore: results.reduce((sum, r) => sum + r.finalScore, 0) / results.length,
      averageMoves: results.reduce((sum, r) => sum + r.totalMoves, 0) / results.length,
      averageMaxTile: results.reduce((sum, r) => sum + r.maxTile, 0) / results.length,
      winRate: results.filter(r => r.won).length / results.length,
      averageDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      totalTokens: results.reduce((sum, r) => sum + (r.totalTokens || 0), 0),
    };

    console.log('\nAggregate Statistics:');
    console.log(`Average Score: ${stats.averageScore.toFixed(2)}`);
    console.log(`Average Moves: ${stats.averageMoves.toFixed(2)}`);
    console.log(`Average Max Tile: ${stats.averageMaxTile.toFixed(2)}`);
    console.log(`Win Rate: ${(stats.winRate * 100).toFixed(2)}%`);
    console.log(`Average Duration: ${stats.averageDuration.toFixed(2)}ms`);
    console.log(`Total Tokens Used: ${stats.totalTokens}`);
    console.log('===================');
  }
}

main().catch(console.error); 