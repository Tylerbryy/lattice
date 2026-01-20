# Lattice

<p align="center">
  <img src="public/latticehd.gif" alt="Lattice Demo" width="800">
</p>

A CLI tool that analyzes stocks through Charlie Munger's 28 mental models using 10 parallel AI agents.

## Features

- **10 Parallel AI Agents** - Each specialized in different mental models
- **28 Mental Models** - Comprehensive Munger-style analysis covering:
  - Core Investment Principles (Circle of Competence, Margin of Safety, Mr. Market, Intrinsic Value)
  - Moats & Ownership (Economic Moats, Owner Earnings, Management Quality)
  - Psychology & Behavioral (Incentive Bias, Social Proof, Confirmation Bias, Loss Aversion, etc.)
  - Lollapalooza Effects & Second-Order Thinking
  - Math & Probability (Inversion, Base Rates, Expected Value, Compound Interest)
  - Economics & Business (Opportunity Cost, Competitive Destruction, Scarcity)
  - Systems Thinking (Feedback Loops, Critical Mass, Scale Economics)
  - Decision Filters (Too Hard Pile, Checklist)
- **Code Execution** - Agents can run Python for DCF models, Monte Carlo simulations, statistical analysis
- **Web Search** - Optional Exa AI integration for real-time market research
- **Finviz Data** - Automatic scraping of fundamental and technical data
- **Charlie's Verdict** - Final synthesis in Munger's voice with actionable rating

## Installation

```bash
# Clone the repo
git clone <repo-url>
cd lattice

# Install dependencies
bun install

# Build
bun run build
```

## Configuration

Run the interactive setup to configure your API keys:

```bash
lattice setup
```

This will guide you through entering your API keys and save them to `~/.lattice/config.json`.

Alternatively, set environment variables:

```bash
# Required
export ANTHROPIC_API_KEY="sk-ant-..."

# Optional (enables web search)
export EXA_API_KEY="exa-..."
```

Or manually create the config file:

```json
{
  "anthropicApiKey": "sk-ant-...",
  "exaApiKey": "exa-..."
}
```

## Usage

```bash
# Analyze a stock
lattice analyze AAPL

# Watch mode - live dashboard showing all agents working
lattice watch AAPL

# Verbose mode - show detailed analysis per mental model
lattice analyze AAPL --verbose
lattice watch AAPL --verbose
```

### History

Analyses are automatically saved and can be retrieved later:

```bash
# List all saved analyses
lattice history

# View a saved analysis by ticker (shows most recent)
lattice view AAPL

# View a saved analysis by ID
lattice view abc123

# View with verbose mode
lattice view AAPL --verbose

# Clear all saved analyses
lattice history --clear
```

Analyses are saved to `~/.lattice/history/`.

### Demo/Testing

```bash
# Mock analysis results for UI testing
lattice mock

# Demo the live agent dashboard with simulated activity
lattice mock-watch
```

### Debug Mode

Enable verbose logging to troubleshoot issues:

```bash
# Logs written to /tmp/lattice-debug.log
LATTICE_VERBOSE=1 bun analyze AAPL

# Custom log file
LATTICE_DEBUG_FILE=/path/to/debug.log LATTICE_VERBOSE=1 bun analyze AAPL
```

## Output

The analysis provides:

- **Signal Summary** - Bullish/bearish/neutral counts across all mental models
- **Charlie's Verdict** - STRONG BUY | BUY | HOLD | SELL | STRONG SELL | TOO HARD
- **Key Numbers** - Intrinsic value estimate, margin of safety, projected CAGR (when computed)
- **Category Insights** - One-line summaries for each mental model category
- **Red Flags** - Specific concerns identified during analysis
- **What Would Make This Better** - Conditions that would improve the investment case

### Example Output

```
╔══════════════════════════════════════════════════════════════════════════╗
║   LATTICE  AAPL Apple Inc                                                 ║
║  Sector: Technology / Consumer Electronics  Market Cap: 3678.01B         ║
║  $250.24  ▼ -2.07%                                                       ║
╚══════════════════════════════════════════════════════════════════════════╝

Signal Distribution
● 3 bullish  ● 15 bearish  ● 14 neutral  ● 0 n/a

[?] CHARLIE'S VERDICT: TOO HARD

Well, here we have one of the finest businesses ever created - Apple makes
more money than God and has built switching costs that would make John D.
Rockefeller envious. The problem is simple: you're being asked to pay $250
for something worth maybe $149, and that's if China doesn't blow up in
their face and the AI story works out...

Key Numbers
├─ Current Price: $250.24
├─ Intrinsic Value Estimate: $149 (PEG 1.5x, historical P/E 20-24x)
├─ Margin of Safety: -68%
└─ 5-Year CAGR Projection: 3.5%

Category Insights
▸ Core: Exceptional business, but paying $250 for $149 of value
▸ Psychology: Confirmation bias ignoring China collapse
▸ Math: Expected 5-year return barely exceeds risk-free rate
▸ Economics: Winner-take-most in US offset by China collapse
▸ Systems: Ecosystem flywheel decelerating measurably
▸ Filters: Passes quality but fails valuation checklist

Red Flags
• P/E of 33.5x for 10% growth = PEG of 2.6 (68% overvalued)
• China revenue down 17% annually, lost #1 to #3 market position
• Insider ownership 0.1% while authorizing $110B buybacks

10 agents • 28 mental models • 338s
```

### Runtime

A full analysis takes approximately **4-6 minutes** depending on API response times. The 10 agents run in parallel, each potentially using code execution for quantitative analysis.

## Architecture

```
CLI Input (ticker)
  → Finviz Scraper (cheerio + fetch)
  → 10 Parallel Agent API Calls (Promise.all)
  → Agentic Loop (handle tool calls)
  → Aggregate Results
  → Final Synthesis (Charlie Munger voice)
  → Ink Render Output
```

## Agent Distribution

| Agent | Mental Models |
|-------|---------------|
| 1 | Circle of Competence, Margin of Safety, Mr. Market, Intrinsic Value |
| 2 | Economic Moats, Owner Earnings, Management Quality |
| 3 | Incentive-Caused Bias, Social Proof, Availability Bias |
| 4 | Confirmation Bias, Commitment & Consistency, Loss Aversion |
| 5 | Lollapalooza Effects, Second-Order Thinking |
| 6 | Inversion, Base Rates |
| 7 | Expected Value, Compound Interest |
| 8 | Opportunity Cost, Sunk Cost Fallacy, Competitive Destruction, Scarcity |
| 9 | Feedback Loops, Critical Mass, Scale Economics |
| 10 | Too Hard Pile, Checklist |

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI**: Anthropic Claude (Haiku 4.5 for agents, Sonnet 4.5 for synthesis)
- **CLI UI**: Ink (React for CLI)
- **Web Scraping**: Cheerio
- **Search**: Exa AI (optional)

## Project Structure

```
lattice/
├── src/
│   ├── index.ts                    # Entry point
│   ├── cli/
│   │   ├── index.tsx               # CLI commands
│   │   ├── commands/analyze.tsx    # Analyze command
│   │   └── components/             # Ink UI components
│   ├── agents/
│   │   ├── orchestrator.ts         # Parallel execution
│   │   ├── agentConfigs/           # 10 agent configurations
│   │   └── tools/exaSearch.ts      # Exa search handler
│   ├── data/
│   │   ├── finvizScraper.ts        # Finviz scraper
│   │   └── types.ts                # TypeScript interfaces
│   ├── models/mentalModels.ts      # 28 mental model definitions
│   ├── synthesis/finalAnalysis.ts  # Charlie Munger synthesis
│   └── utils/
│       ├── config.ts               # Config loader
│       └── formatting.ts           # Utilities
├── bin/lattice.js
├── package.json
└── tsconfig.json
```

## License

MIT
