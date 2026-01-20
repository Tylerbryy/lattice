import React from "react";
import { Box, Text } from "ink";
import type { KeyNumbers } from "../../data/types.js";

interface QuantHighlightsProps {
  keyNumbers?: KeyNumbers;
  currentPrice?: string;
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
        {keyNumbers.marginOfSafety !== undefined && (
          <Box>
            <Text dimColor>Margin of Safety: </Text>
            <Text
              color={
                keyNumbers.marginOfSafety > 0.25
                  ? "green"
                  : keyNumbers.marginOfSafety > 0
                    ? "yellow"
                    : "red"
              }
            >
              {(keyNumbers.marginOfSafety * 100).toFixed(1)}%
            </Text>
          </Box>
        )}
        {keyNumbers.fiveYearCAGRProjection !== undefined && (
          <Box>
            <Text dimColor>5-Year CAGR Projection: </Text>
            <Text
              color={
                keyNumbers.fiveYearCAGRProjection > 0.15
                  ? "green"
                  : keyNumbers.fiveYearCAGRProjection > 0.08
                    ? "yellow"
                    : "red"
              }
            >
              {(keyNumbers.fiveYearCAGRProjection * 100).toFixed(1)}%
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
