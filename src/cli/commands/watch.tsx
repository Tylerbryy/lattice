import React, { useState, useEffect } from "react";
import { render, Box, Text, useApp } from "ink";
import { AgentDashboard, type AgentState } from "../components/AgentDashboard.js";
import { Results } from "../components/Results.js";
import { scrapeFinviz } from "../../data/finvizScraper.js";
import { runAllAgents, type AnalysisProgress } from "../../agents/orchestrator.js";
import { synthesizeAnalysis } from "../../synthesis/finalAnalysis.js";
import { loadConfig } from "../../utils/config.js";
import { allAgentConfigs } from "../../agents/agentConfigs/index.js";
import type { AnalysisResult } from "../../data/types.js";

interface WatchAppProps {
  ticker: string;
  verbose?: boolean;
}

function WatchApp({ ticker, verbose = false }: WatchAppProps) {
  const { exit } = useApp();
  const [phase, setPhase] = useState<"fetching" | "analyzing" | "synthesizing" | "complete" | "error">("fetching");
  const [agents, setAgents] = useState<AgentState[]>(() =>
    allAgentConfigs.map((config) => ({
      id: config.id,
      name: config.name,
      status: "pending",
      toolCalls: 0,
      inputTokens: 0,
      outputTokens: 0,
      mentalModels: config.models,
      completedModels: 0,
    }))
  );
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);
    return () => clearInterval(interval);
  }, [startTime]);

  // Exit app once complete so user can scroll terminal
  useEffect(() => {
    if (phase === "complete" || phase === "error") {
      const timeout = setTimeout(() => exit(), 100);
      return () => clearTimeout(timeout);
    }
  }, [phase, exit]);

  // Run analysis
  useEffect(() => {
    async function runAnalysis() {
      try {
        // Load config
        const config = loadConfig();
        if (!config.anthropicApiKey) {
          throw new Error("ANTHROPIC_API_KEY not configured");
        }

        // Fetch data
        setPhase("fetching");
        const financialData = await scrapeFinviz(ticker);

        // Run agents
        setPhase("analyzing");
        const agentOutputs = await runAllAgents(
          ticker,
          financialData,
          config,
          (progress: AnalysisProgress) => {
            setAgents((prev) =>
              prev.map((agent) => {
                const agentProgress = progress.agents.find((a) => a.agentId === agent.id);
                if (!agentProgress) return agent;

                let status: AgentState["status"] = "pending";
                if (agentProgress.status === "running") {
                  status = agentProgress.lastAction?.includes("search") ||
                    agentProgress.lastAction?.includes("code")
                    ? "tool_call"
                    : "thinking";
                } else if (agentProgress.status === "completed") {
                  status = "done";
                } else if (agentProgress.status === "error") {
                  status = "error";
                }

                return {
                  ...agent,
                  status,
                  currentTool: agentProgress.lastAction,
                  toolCalls: agentProgress.turn,
                  inputTokens: agentProgress.inputTokens,
                  outputTokens: agentProgress.outputTokens,
                  completedModels: status === "done" ? agent.mentalModels.length : Math.floor(agentProgress.turn / 2),
                };
              })
            );
          }
        );

        // Synthesize
        setPhase("synthesizing");
        const finalAnalysis = await synthesizeAnalysis(ticker, financialData, agentOutputs, config);

        // Complete
        setPhase("complete");
        setResult({
          ticker,
          financialData,
          agentOutputs,
          finalAnalysis,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setPhase("error");
      }
    }

    runAnalysis();
  }, [ticker]);

  if (phase === "error") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red" bold>Error: {error}</Text>
      </Box>
    );
  }

  if (phase === "complete" && result) {
    return <Results result={result} verbose={verbose} elapsedTime={elapsedTime} />;
  }

  return (
    <AgentDashboard
      agents={agents}
      ticker={ticker.toUpperCase()}
      elapsedTime={elapsedTime}
      phase={phase}
    />
  );
}

export async function watchCommand(ticker: string, options: { verbose?: boolean }): Promise<void> {
  const { waitUntilExit } = render(
    <WatchApp ticker={ticker.toUpperCase()} verbose={options.verbose} />,
    { patchConsole: false }
  );
  await waitUntilExit();
}
