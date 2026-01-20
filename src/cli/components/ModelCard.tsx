import React from "react";
import { Box, Text } from "ink";
import type { ModelAnalysis, Signal } from "../../data/types.js";

interface ModelCardProps {
  analysis: ModelAnalysis;
  compact?: boolean;
}

function getSignalColor(signal: Signal): string {
  switch (signal) {
    case "bullish":
      return "green";
    case "bearish":
      return "red";
    case "neutral":
      return "yellow";
    case "insufficient_data":
      return "gray";
    default:
      return "white";
  }
}

function getSignalSymbol(signal: Signal): string {
  switch (signal) {
    case "bullish":
      return "+";
    case "bearish":
      return "-";
    case "neutral":
      return "=";
    case "insufficient_data":
      return "?";
    default:
      return " ";
  }
}

export function ModelCard({ analysis, compact = false }: ModelCardProps) {
  const color = getSignalColor(analysis.signal);
  const symbol = getSignalSymbol(analysis.signal);

  if (compact) {
    return (
      <Box>
        <Text color={color}>[{symbol}]</Text>
        <Text> {analysis.modelName}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text color={color} bold>
          [{symbol}] {analysis.modelName}
        </Text>
      </Box>
      <Box marginLeft={4} flexDirection="column">
        <Text wrap="wrap" dimColor>
          {analysis.assessment}
        </Text>
        {analysis.keyFactors.length > 0 && (
          <Box marginTop={1} flexDirection="column">
            <Text dimColor>Key factors:</Text>
            {analysis.keyFactors.map((factor, i) => (
              <Text key={i} dimColor>
                {"  "}• {factor}
              </Text>
            ))}
          </Box>
        )}
        {analysis.quantitativeFindings &&
          analysis.quantitativeFindings.length > 0 && (
            <Box marginTop={1} flexDirection="column">
              <Text dimColor>Quantitative findings:</Text>
              {analysis.quantitativeFindings.map((finding, i) => (
                <Text key={i} dimColor>
                  {"  "}{finding.metric}: {finding.value}
                </Text>
              ))}
            </Box>
          )}
      </Box>
    </Box>
  );
}

interface ModelCardGroupProps {
  title: string;
  analyses: ModelAnalysis[];
  compact?: boolean;
}

export function ModelCardGroup({
  title,
  analyses,
  compact = false,
}: ModelCardGroupProps) {
  if (analyses.length === 0) return null;

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold underline>
        {title}
      </Text>
      {analyses.map((analysis, i) => (
        <ModelCard key={i} analysis={analysis} compact={compact} />
      ))}
    </Box>
  );
}
