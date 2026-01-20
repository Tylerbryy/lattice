import { Command } from "commander";
import { analyzeCommand } from "./commands/analyze.js";
import { mockCommand } from "./commands/mock.js";
import { watchCommand } from "./commands/watch.js";
import { mockWatchCommand } from "./commands/mock-watch.js";

const program = new Command();

program
  .name("lattice")
  .description(
    "Analyze stocks through Charlie Munger's latticework of mental models using AI agents"
  )
  .version("1.0.0");

program
  .command("analyze")
  .description("Analyze a stock ticker through 28 mental models")
  .argument("<ticker>", "Stock ticker symbol (e.g., AAPL, MSFT, NVDA)")
  .option("-v, -V, --verbose", "Show detailed analysis for each mental model")
  .action(async (ticker: string, options: { verbose?: boolean }) => {
    await analyzeCommand(ticker, options);
  });

program
  .command("mock")
  .description("Display mock analysis results for UI testing")
  .option("-v, -V, --verbose", "Show detailed analysis for each mental model")
  .action(async (options: { verbose?: boolean }) => {
    await mockCommand(options);
  });

program
  .command("watch")
  .description("Analyze with live dashboard showing all agents working")
  .argument("<ticker>", "Stock ticker symbol (e.g., AAPL, MSFT, NVDA)")
  .option("-v, -V, --verbose", "Show detailed analysis for each mental model")
  .action(async (ticker: string, options: { verbose?: boolean }) => {
    await watchCommand(ticker, options);
  });

program
  .command("mock-watch")
  .description("Demo the live agent dashboard with simulated activity")
  .action(async () => {
    await mockWatchCommand();
  });

export function runCli(): void {
  program.parse();
}
