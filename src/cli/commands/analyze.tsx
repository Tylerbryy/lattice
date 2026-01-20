import React, { useState, useEffect, useRef } from "react";
import { Box, Text, render } from "ink";
import { Spinner } from "../components/Spinner.js";
import { Results } from "../components/Results.js";
import { Header } from "../components/Header.js";
import { scrapeFinviz } from "../../data/finvizScraper.js";
import {
  runAllAgents,
  type AnalysisProgress,
} from "../../agents/orchestrator.js";
import { synthesizeAnalysis } from "../../synthesis/finalAnalysis.js";
import { loadConfig } from "../../utils/config.js";
import { saveAnalysis } from "../../utils/history.js";
import type { AnalysisResult, FinvizData, AgentOutput } from "../../data/types.js";

type Phase = "init" | "fetching" | "analyzing" | "synthesizing" | "done" | "error";

interface AnalyzeAppProps {
  ticker: string;
  verbose?: boolean;
}

function AnalyzeApp({ ticker, verbose }: AnalyzeAppProps) {
  const [phase, setPhase] = useState<Phase>("init");
  const [progress, setProgress] = useState<AnalysisProgress>({
    completed: 0,
    total: 10,
    agents: [],
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState<FinvizData | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    async function runAnalysis() {
      try {
        // Load config
        const config = loadConfig();

        // Phase 1: Fetch financial data
        setPhase("fetching");
        let data: FinvizData;
        try {
          data = await scrapeFinviz(ticker);
          setFinancialData(data);
        } catch (err) {
          throw new Error(
            `Failed to fetch data for ${ticker}: ${err instanceof Error ? err.message : "Unknown error"}`
          );
        }

        // Phase 2: Run all agents in parallel
        setPhase("analyzing");
        let agentOutputs: AgentOutput[];
        try {
          agentOutputs = await runAllAgents(
            ticker,
            data,
            config,
            (prog) => setProgress(prog)
          );
        } catch (err) {
          throw new Error(
            `Agent analysis failed: ${err instanceof Error ? err.message : "Unknown error"}`
          );
        }

        // Phase 3: Synthesize with Charlie Munger voice
        setPhase("synthesizing");
        const finalAnalysis = await synthesizeAnalysis(
          ticker,
          data,
          agentOutputs,
          config
        );

        // Done
        const elapsed = Date.now() - startTimeRef.current;
        setElapsedTime(elapsed);
        const analysisResult: AnalysisResult = {
          ticker,
          financialData: data,
          agentOutputs,
          finalAnalysis,
        };
        setResult(analysisResult);

        // Save to history
        saveAnalysis(analysisResult, elapsed);

        setPhase("done");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setPhase("error");
      }
    }

    runAnalysis();
  }, [ticker]);

  if (phase === "error") {
    return (
      <Box flexDirection="column" marginY={1} paddingX={1}>
        <Box>
          <Text backgroundColor="red" color="white" bold> ERROR </Text>
          <Text color="red" bold> Failed to analyze {ticker}</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="red">{error}</Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>
            Make sure ANTHROPIC_API_KEY is set in your environment or ~/.lattice/config.json
          </Text>
        </Box>
      </Box>
    );
  }

  if (phase === "done" && result) {
    return <Results result={result} verbose={verbose} elapsedTime={elapsedTime} />;
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Show header with data once we have it */}
      {financialData ? (
        <Header
          ticker={ticker}
          companyName={financialData.companyName}
          sector={financialData.sector}
          industry={financialData.industry}
          marketCap={financialData.marketCap}
          price={financialData.price}
          change={financialData.change}
        />
      ) : (
        <Box marginBottom={1}>
          <Text backgroundColor="cyan" color="black" bold>
            {" "}LATTICE{" "}
          </Text>
          <Text color="cyan" bold> {ticker.toUpperCase()}</Text>
        </Box>
      )}

      <Spinner
        phase={phase === "init" ? "fetching" : phase as "fetching" | "analyzing" | "synthesizing"}
        progress={progress}
        ticker={ticker}
        startTime={startTimeRef.current}
      />
    </Box>
  );
}

export async function analyzeCommand(
  ticker: string,
  options: { verbose?: boolean }
): Promise<void> {
  return new Promise((resolve) => {
    const { unmount, waitUntilExit } = render(
      <AnalyzeApp ticker={ticker.toUpperCase()} verbose={options.verbose} />
    );

    waitUntilExit().then(() => {
      unmount();
      resolve();
    });
  });
}
