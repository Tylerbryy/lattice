import React from "react";
import { Box, Text } from "ink";
import type { KeyNumbers } from "../../data/types.js";

interface QuantHighlightsProps {
  keyNumbers?: KeyNumbers;
  currentPrice?: string;
}

// Normalize percentage values - LLM sometimes returns 0.25 (25%) or 25 (25%)
function normalizePercent(value: number | undefined): number | undefined {
  if (value === undefined) return undefined;
  // If absolute value > 2, assume it's already a percentage (e.g., 25 means 25%)
  // Otherwise assume it's a decimal (e.g., 0.25 means 25%)
  return Math.abs(value) > 2 ? value / 100 : value;
}

export function QuantHighlights({ keyNumbers, currentPrice }: QuantHighlightsProps) {
  if (!keyNumbers) {
    return null;
  }

  const hasAnyData =
    keyNumbers.intrinsicValueEstimate ||
    keyNumbers.marginOfSafety !== undefined ||
    keyNumbers.fiveYearCAGRProjection !== undefined;

  if (!hasAnyData) {
    return null;
  }

  // Normalize the percentage values
  const marginOfSafety = normalizePercent(keyNumbers.marginOfSafety);
  const fiveYearCAGR = normalizePercent(keyNumbers.fiveYearCAGRProjection);

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold underline>
        Key Numbers
      </Text>
      <Box marginTop={1} flexDirection="column">
        {currentPrice && (
          <Box>
            <Text dimColor>Current Price: </Text>
            <Text>{currentPrice}</Text>
          </Box>
        )}
        {keyNumbers.intrinsicValueEstimate && (
          <Box>
            <Text dimColor>Intrinsic Value Estimate: </Text>
            <Text color="cyan">
              ${keyNumbers.intrinsicValueEstimate.value.toFixed(2)}
            </Text>
            <Text dimColor> ({keyNumbers.intrinsicValueEstimate.methodology})</Text>
          </Box>
        )}
        {marginOfSafety !== undefined && (
          <Box>
            <Text dimColor>Margin of Safety: </Text>
            <Text
              color={
                marginOfSafety > 0.25
                  ? "green"
                  : marginOfSafety > 0
                    ? "yellow"
                    : "red"
              }
            >
              {(marginOfSafety * 100).toFixed(1)}%
            </Text>
          </Box>
        )}
        {fiveYearCAGR !== undefined && (
          <Box>
            <Text dimColor>5-Year CAGR Projection: </Text>
            <Text
              color={
                fiveYearCAGR > 0.15
                  ? "green"
                  : fiveYearCAGR > 0.08
                    ? "yellow"
                    : "red"
              }
            >
              {(fiveYearCAGR * 100).toFixed(1)}%
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
