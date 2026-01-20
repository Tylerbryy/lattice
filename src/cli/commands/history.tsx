import React from "react";
import { render, Box, Text } from "ink";
import { listAnalyses, clearHistory, type AnalysisSummary } from "../../utils/history.js";

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } else if (diffDays === 1) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case "STRONG BUY":
      return "green";
    case "BUY":
      return "greenBright";
    case "HOLD":
      return "yellow";
    case "SELL":
      return "redBright";
    case "STRONG SELL":
      return "red";
    case "TOO HARD":
      return "gray";
    default:
      return "white";
  }
}

interface HistoryAppProps {
  analyses: AnalysisSummary[];
}

function HistoryApp({ analyses }: HistoryAppProps) {
  if (analyses.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text backgroundColor="cyan" color="black" bold> LATTICE </Text>
          <Text bold color="cyan"> History</Text>
        </Box>
        <Text dimColor>No analyses saved yet.</Text>
        <Text dimColor>Run `lattice analyze AAPL` to get started.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text backgroundColor="cyan" color="black" bold> LATTICE </Text>
        <Text bold color="cyan"> History</Text>
        <Text dimColor> ({analyses.length} analyses)</Text>
      </Box>

      {/* Header */}
      <Box marginBottom={1}>
        <Box width={8}>
          <Text bold dimColor>TICKER</Text>
        </Box>
        <Box width={20}>
          <Text bold dimColor>COMPANY</Text>
        </Box>
        <Box width={12}>
          <Text bold dimColor>VERDICT</Text>
        </Box>
        <Box width={10}>
          <Text bold dimColor>PRICE</Text>
        </Box>
        <Box width={14}>
          <Text bold dimColor>DATE</Text>
        </Box>
        <Box>
          <Text bold dimColor>ID</Text>
        </Box>
      </Box>

      {/* Rows */}
      {analyses.map((a) => (
        <Box key={a.id}>
          <Box width={8}>
            <Text bold color="cyan">{a.ticker}</Text>
          </Box>
          <Box width={20}>
            <Text>{a.companyName.length > 18 ? a.companyName.slice(0, 17) + "…" : a.companyName}</Text>
          </Box>
          <Box width={12}>
            <Text color={getVerdictColor(a.verdict)}>{a.verdict}</Text>
          </Box>
          <Box width={10}>
            <Text>${a.price}</Text>
          </Box>
          <Box width={14}>
            <Text dimColor>{formatDate(a.timestamp)}</Text>
          </Box>
          <Box>
            <Text dimColor>{a.id}</Text>
          </Box>
        </Box>
      ))}

      <Box marginTop={1}>
        <Text dimColor>View details: </Text>
        <Text color="cyan">lattice view {"<ticker|id>"}</Text>
      </Box>
    </Box>
  );
}

export async function historyCommand(options: { clear?: boolean }): Promise<void> {
  if (options.clear) {
    const deleted = clearHistory();
    console.log(`Cleared ${deleted} saved analyses.`);
    return;
  }

  const analyses = listAnalyses();

  const { waitUntilExit } = render(<HistoryApp analyses={analyses} />);
  await waitUntilExit();
}
