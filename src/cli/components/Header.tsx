import React from "react";
import { Box, Text, useStdout } from "ink";

interface HeaderProps {
  ticker: string;
  companyName?: string;
  sector?: string;
  industry?: string;
  marketCap?: string;
  price?: string;
  change?: string;
}

export function Header({
  ticker,
  companyName,
  sector,
  industry,
  marketCap,
  price,
  change,
}: HeaderProps) {
  const { stdout } = useStdout();
  const terminalWidth = stdout?.columns || 80;
  const contentWidth = Math.min(terminalWidth - 4, 100);

  const isPositive = change && !change.startsWith("-");
  const changeColor = isPositive ? "green" : "red";
  const changeArrow = isPositive ? "▲" : "▼";

  return (
    <Box flexDirection="column" marginBottom={1} width={contentWidth}>
      {/* Main title box */}
      <Box
        borderStyle="double"
        borderColor="cyan"
        paddingX={2}
        paddingY={1}
        flexDirection="column"
      >
        {/* Title row */}
        <Box>
          <Text backgroundColor="cyan" color="black" bold>
            {" "}LATTICE{" "}
          </Text>
          <Text color="cyan" bold>
            {" "}{ticker}
          </Text>
          {companyName && (
            <Text color="white" bold> {companyName}</Text>
          )}
        </Box>

        {/* Info row */}
        {(sector || marketCap || price) && (
          <Box marginTop={1} flexWrap="wrap">
            {sector && (
              <Box marginRight={2}>
                <Text color="gray">Sector: </Text>
                <Text color="white">{sector}</Text>
                {industry && (
                  <Text color="gray"> / {industry}</Text>
                )}
              </Box>
            )}
            {marketCap && (
              <Box marginRight={2}>
                <Text color="gray">Market Cap: </Text>
                <Text color="yellow" bold>{marketCap}</Text>
              </Box>
            )}
          </Box>
        )}

        {/* Price row */}
        {price && (
          <Box marginTop={1}>
            <Text color="white" bold>$</Text>
            <Text color="white" bold>{price}</Text>
            {change && (
              <Box marginLeft={2}>
                <Text color={changeColor} bold>{changeArrow} {change}</Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
