import React from "react";
import { Box, Text, Spacer } from "ink";
import { Markdown } from "./Markdown.js";
import type { Verdict } from "../../data/types.js";

interface VerdictBoxProps {
  verdict: Verdict;
  whatCharlieWouldSay: string;
  conviction?: number;
}

function getVerdictColor(verdict: Verdict): string {
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

function getVerdictSymbol(verdict: Verdict): string {
  switch (verdict) {
    case "STRONG BUY":
      return "++";
    case "BUY":
      return "+";
    case "HOLD":
      return "=";
    case "SELL":
      return "-";
    case "STRONG SELL":
      return "--";
    case "TOO HARD":
      return "?";
    default:
      return "";
  }
}

export function VerdictBox({ verdict, whatCharlieWouldSay, conviction }: VerdictBoxProps) {
  const color = getVerdictColor(verdict);
  const symbol = getVerdictSymbol(verdict);

  return (
    <Box flexDirection="column" marginY={1}>
      <Box
        borderStyle="round"
        borderColor={color}
        paddingX={2}
        paddingY={1}
        flexDirection="column"
      >
        {/* Header with verdict and conviction */}
        <Box marginBottom={1} justifyContent="space-between">
          <Text bold color={color}>
            [{symbol}] CHARLIE'S VERDICT: {verdict}
          </Text>
          {conviction !== undefined && (
            <Box>
              <Text dimColor>Conviction: </Text>
              <Text color={conviction > 0.7 ? "green" : conviction > 0.4 ? "yellow" : "red"}>
                {"●".repeat(Math.round(conviction * 5))}
                {"○".repeat(5 - Math.round(conviction * 5))}
              </Text>
            </Box>
          )}
        </Box>

        {/* Charlie's wisdom */}
        <Box flexDirection="column">
          <Markdown>{whatCharlieWouldSay}</Markdown>
        </Box>
      </Box>
    </Box>
  );
}
