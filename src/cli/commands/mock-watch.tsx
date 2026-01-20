import React, { useState, useEffect } from "react";
import { render } from "ink";
import { AgentDashboard, type AgentState } from "../components/AgentDashboard.js";
import { allAgentConfigs } from "../../agents/agentConfigs/index.js";

const TOOLS = [
  "Thinking...",
  "code_execution: DCF model",
  "code_execution: Monte Carlo",
  "exa_search: recent news",
  "code_execution: sensitivity",
  "Analyzing margins...",
  "Computing intrinsic value...",
  "Evaluating moat strength...",
  "code_execution: regression",
  "exa_search: competitor analysis",
];

function MockWatchApp() {
  const [phase, setPhase] = useState<"fetching" | "analyzing" | "synthesizing" | "complete">("fetching");
  const [agents, setAgents] = useState<AgentState[]>(() =>
    allAgentConfigs.map((config) => ({
      id: config.id,
      name: config.name,
      status: "pending",
      toolCalls: 0,
      tokensUsed: 0,
      mentalModels: config.models,
      completedModels: 0,
    }))
  );
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);
    return () => clearInterval(interval);
  }, [startTime]);

  // Simulate fetching phase
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPhase("analyzing");
    }, 1500);
    return () => clearTimeout(timeout);
  }, []);

  // Simulate agent progress
  useEffect(() => {
    if (phase !== "analyzing") return;

    const timeouts: NodeJS.Timeout[] = [];

    agents.forEach((agent, index) => {
      // Start each agent with a random delay
      const startDelay = Math.random() * 2000 + index * 200;

      timeouts.push(
        setTimeout(() => {
          setAgents((prev) =>
            prev.map((a) =>
              a.id === agent.id
                ? { ...a, status: "thinking", currentTool: "Starting analysis..." }
                : a
            )
          );
        }, startDelay)
      );

      // Simulate tool calls
      const numToolCalls = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < numToolCalls; i++) {
        const toolDelay = startDelay + (i + 1) * (Math.random() * 2000 + 1500);
        timeouts.push(
          setTimeout(() => {
            const tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
            const isToolCall = tool.includes("code_execution") || tool.includes("exa_search");

            setAgents((prev) =>
              prev.map((a) => {
                if (a.id !== agent.id) return a;
                return {
                  ...a,
                  status: isToolCall ? "tool_call" : "thinking",
                  currentTool: tool,
                  toolCalls: a.toolCalls + 1,
                  tokensUsed: a.tokensUsed + Math.floor(Math.random() * 2000) + 500,
                  completedModels: Math.min(
                    a.completedModels + 1,
                    a.mentalModels.length - 1
                  ),
                };
              })
            );
          }, toolDelay)
        );
      }

      // Complete agent
      const completeDelay = startDelay + numToolCalls * 2500 + Math.random() * 3000;
      timeouts.push(
        setTimeout(() => {
          setAgents((prev) =>
            prev.map((a) =>
              a.id === agent.id
                ? {
                    ...a,
                    status: "done",
                    currentTool: undefined,
                    completedModels: a.mentalModels.length,
                    tokensUsed: a.tokensUsed + Math.floor(Math.random() * 1000),
                  }
                : a
            )
          );
        }, completeDelay)
      );
    });

    return () => timeouts.forEach(clearTimeout);
  }, [phase]);

  // Check if all agents are done
  useEffect(() => {
    if (phase !== "analyzing") return;

    const allDone = agents.every((a) => a.status === "done");
    if (allDone) {
      setPhase("synthesizing");
      // Simulate synthesis
      setTimeout(() => {
        setPhase("complete");
      }, 3000);
    }
  }, [agents, phase]);

  return (
    <AgentDashboard
      agents={agents}
      ticker="DEMO"
      elapsedTime={elapsedTime}
      phase={phase}
    />
  );
}

export async function mockWatchCommand(): Promise<void> {
  const { waitUntilExit } = render(<MockWatchApp />, { patchConsole: false });
  await waitUntilExit();
}
