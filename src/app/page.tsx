"use client"

export default function Home() {
  // Model rankings data
  const modelRankings = [
    {
      model: "GPT 4",
      score: 56.80,
      maxTile: 11.20,
      winRate: "0.00%"
    },
    {
      model: "GPT-3.5-Turbo",
      score: 55.20,
      maxTile: 10.40,
      winRate: "0.00%"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen flex flex-col relative">
      <header className="text-center mb-12 font-sans">
        <div className="text-2xl mb-6">2048 BENCH</div>
      </header>

      <main className="flex-grow mb-16">
        <div className="mb-8" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
          <p className="mb-4">What happens when you make LLMs play 2048? We tested various models to see who would achieve the highest scores.</p>
          <p className="mb-4">Each model plays multiple games, and we track their average score, maximum tile achieved, and win rate.</p>
        </div>

        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4">Model</th>
                <th className="py-2 px-4">Score</th>
                <th className="py-2 px-4">Max Tile</th>
                <th className="py-2 px-4">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {modelRankings.map((model, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 pr-4">{model.model}</td>
                  <td className="py-2 px-4">{model.score.toFixed(2)}</td>
                  <td className="py-2 px-4">{model.maxTile}</td>
                  <td className="py-2 px-4">{model.winRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <footer className="text-right py-4 text-gray-600 absolute bottom-0 right-0 pr-4" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <p className="text-sm">
          Made by <a href="https://iandalmas.com" className="hover:underline">Ian Dalmas</a> • <a href="https://github.com/idalmas/2048bench" className="hover:underline">Source Code</a>
        </p>
      </footer>
    </div>
  );
}