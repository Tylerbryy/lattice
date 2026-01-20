import React from "react";
import { Box, Text, Spacer } from "ink";
import { Markdown } from "./Markdown.js";
import type { Verdict } from "../../data/types.js";
import type { PersonaConfig } from "../../personas/types.js";
import { getPersonaSafe } from "../../personas/index.js";

interface VerdictBoxProps {
  verdict: Verdict;
  personaAnalysis: string;
  /** @deprecated Use personaAnalysis instead */
  whatCharlieWouldSay?: string;
  conviction?: number;
  persona?: PersonaConfig;
}

export function VerdictBox({ verdict, personaAnalysis, whatCharlieWouldSay, conviction, persona }: VerdictBoxProps) {
  // Resolve persona
  const resolvedPersona = persona || getPersonaSafe("munger");

  // Get analysis text (support backward compatibility)
  const analysisText = personaAnalysis || whatCharlieWouldSay || "";

  // Use persona helpers for color and symbol
  const color = resolvedPersona.getVerdictColor(verdict);
  const symbol = resolvedPersona.getVerdictSymbol(verdict);

  // Persona-specific header label
  const headerLabel = resolvedPersona.id === "cathie"
    ? "CATHIE'S VERDICT"
    : "CHARLIE'S VERDICT";

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
            [{symbol}] {headerLabel}: {verdict}
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

        {/* Persona's wisdom */}
        <Box flexDirection="column">
          <Markdown>{analysisText}</Markdown>
        </Box>
      </Box>
    </Box>
  );
}
