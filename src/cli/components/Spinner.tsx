import React, { useState, useEffect } from "react";
import { Box, Text, useStdout } from "ink";
import InkSpinner from "ink-spinner";
import type { AnalysisProgress, AgentProgress } from "../../agents/orchestrator.js";

interface SpinnerProps {
  phase: "fetching" | "analyzing" | "synthesizing";
  progress?: AnalysisProgress;
  ticker?: string;
  startTime?: number;
}

const AGENT_SHORT_NAMES: Record<number, string> = {
  1: "Core Investment",
  2: "Moats & Owner",
  3: "Psychology I",
  4: "Psychology II",
  5: "Lollapalooza",
  6: "Math & Prob I",
  7: "Math & Prob II",
  8: "Economics",
  9: "Systems",
  10: "Decision Filters",
};

const AGENT_EMOJIS: Record<number, string> = {
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
};

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function formatTokens(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}m`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}k`;
  }
  return `${count}`;
}

function ProgressBar({ filled, total, width, filledChar = "█", emptyChar = "░" }: {
  filled: number;
  total: number;
  width: number;
  filledChar?: string;
  emptyChar?: string;
}) {
  const filledWidth = Math.round((filled / total) * width);
  const emptyWidth = width - filledWidth;

  return (
    <Text>
      <Text color="green">{filledChar.repeat(filledWidth)}</Text>
      <Text color="gray">{emptyChar.repeat(emptyWidth)}</Text>
    </Text>
  );
}

function AgentRow({ agent, width }: { agent: AgentProgress; width: number }) {
  const name = AGENT_SHORT_NAMES[agent.agentId] || agent.agentName.slice(0, 16);
  const num = AGENT_EMOJIS[agent.agentId] || "?";

  let statusIcon: string;
  let statusColor: string;
  let nameColor: string;
  let showProgress = false;

  switch (agent.status) {
    case "completed":
      statusIcon = "✓";
      statusColor = "green";
      nameColor = "green";
      break;
    case "running":
      statusIcon = "◉";
      statusColor = "cyan";
      nameColor = "white";
      showProgress = true;
      break;
    case "error":
      statusIcon = "✗";
      statusColor = "red";
      nameColor = "red";
      break;
    default:
      statusIcon = "○";
      statusColor = "gray";
      nameColor = "gray";
  }

  const progressWidth = 10;
  const nameWidth = 16;
  const actionWidth = Math.max(12, width - nameWidth - progressWidth - 10);

  return (
    <Box width={width}>
      <Box width={3}>
        <Text color={statusColor}>{statusIcon} </Text>
      </Box>
      <Box width={nameWidth}>
        <Text color={nameColor} bold={agent.status === "running"}>
          {name.padEnd(nameWidth)}
        </Text>
      </Box>
      {showProgress ? (
        <>
          <Box marginLeft={1} width={progressWidth + 2}>
            <Text color="gray">[</Text>
            <ProgressBar filled={agent.turn} total={agent.maxTurns} width={progressWidth} />
            <Text color="gray">]</Text>
          </Box>
          <Box marginLeft={1} width={actionWidth}>
            <Text color="yellow">{(agent.lastAction || "").slice(0, actionWidth)}</Text>
          </Box>
        </>
      ) : agent.status === "completed" ? (
        <Box marginLeft={1}>
          <Text color="green" dimColor>complete</Text>
        </Box>
      ) : (
        <Box marginLeft={1}>
          <Text color="gray" dimColor>waiting</Text>
        </Box>
      )}
    </Box>
  );
}

function OverallProgressBar({ completed, total, width }: { completed: number; total: number; width: number }) {
  const barWidth = Math.max(30, width - 20);
  const filled = Math.round((completed / total) * barWidth);
  const empty = barWidth - filled;
  const percent = Math.round((completed / total) * 100);

  return (
    <Box>
      <Text color="cyan">[</Text>
      <Text color="green">{"█".repeat(filled)}</Text>
      <Text color="gray">{"░".repeat(empty)}</Text>
      <Text color="cyan">]</Text>
      <Text bold color="white"> {percent}%</Text>
      <Text color="gray"> ({completed}/{total} agents)</Text>
    </Box>
  );
}

export function Spinner({ phase, progress, ticker, startTime }: SpinnerProps) {
  const [elapsed, setElapsed] = useState(0);
  const { stdout } = useStdout();
  const terminalWidth = stdout?.columns || 80;
  const contentWidth = Math.min(terminalWidth - 4, 100);
  const agentColWidth = Math.floor((contentWidth - 4) / 2);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 100);
    return () => clearInterval(interval);
  }, [startTime]);

  const getPhaseInfo = () => {
    switch (phase) {
      case "fetching":
        return { text: "Fetching financial data from Finviz", step: 1 };
      case "analyzing":
        return { text: "Running 10 mental model agents in parallel", step: 2 };
      case "synthesizing":
        return { text: "Charlie Munger synthesizing final analysis", step: 3 };
      default:
        return { text: "Working", step: 0 };
    }
  };

  const { text, step } = getPhaseInfo();

  return (
    <Box flexDirection="column" marginY={1} width={contentWidth}>
      {/* Phase header */}
      <Box
        borderStyle="round"
        borderColor="cyan"
        paddingX={2}
        paddingY={1}
        flexDirection="column"
      >
        <Box>
          <Text color="gray">[{step}/3] </Text>
          <Text color="cyan">
            <InkSpinner type="dots" />
          </Text>
          <Text bold color="white"> {text}</Text>
        </Box>
        {startTime && (
          <Box marginTop={1}>
            <Text color="gray">Elapsed: </Text>
            <Text color="yellow">{formatElapsed(elapsed)}</Text>
          </Box>
        )}
      </Box>

      {/* Agent progress grid */}
      {phase === "analyzing" && progress?.agents && (
        <Box flexDirection="column" marginTop={1}>
          {/* Overall progress bar */}
          <Box
            borderStyle="single"
            borderColor="gray"
            paddingX={2}
            paddingY={1}
            flexDirection="column"
          >
            <Text color="cyan" bold>Overall Progress</Text>
            <Box marginTop={1}>
              <OverallProgressBar
                completed={progress.completed}
                total={progress.total}
                width={contentWidth - 6}
              />
            </Box>
          </Box>

          {/* Agent grid */}
          <Box
            borderStyle="single"
            borderColor="gray"
            paddingX={2}
            paddingY={1}
            marginTop={1}
            flexDirection="column"
          >
            <Text color="cyan" bold>Agent Status</Text>
            <Box marginTop={1} flexDirection="column">
              {/* Two-column layout */}
              {[0, 2, 4, 6, 8].map((startIdx) => (
                <Box key={startIdx}>
                  <Box width={agentColWidth}>
                    {progress.agents[startIdx] && (
                      <AgentRow agent={progress.agents[startIdx]} width={agentColWidth} />
                    )}
                  </Box>
                  <Box width={agentColWidth}>
                    {progress.agents[startIdx + 1] && (
                      <AgentRow agent={progress.agents[startIdx + 1]} width={agentColWidth} />
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Synthesizing message */}
      {phase === "synthesizing" && (
        <Box
          borderStyle="double"
          borderColor="yellow"
          paddingX={2}
          paddingY={1}
          marginTop={1}
        >
          <Text color="yellow">
            Combining insights from 28 mental models into final analysis...
          </Text>
        </Box>
      )}
    </Box>
  );
}
