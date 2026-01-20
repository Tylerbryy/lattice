import React from "react";
import { render, Box, Text } from "ink";
import { Results } from "../components/Results.js";
import { getAnalysis } from "../../utils/history.js";

interface NotFoundProps {
  query: string;
}

function NotFound({ query }: NotFoundProps) {
  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text backgroundColor="cyan" color="black" bold> LATTICE </Text>
        <Text bold color="cyan"> View</Text>
      </Box>
      <Box>
        <Text color="red">✗ </Text>
        <Text>No analysis found for "</Text>
        <Text bold>{query}</Text>
        <Text>"</Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Run </Text>
        <Text color="cyan">lattice history</Text>
        <Text dimColor> to see saved analyses.</Text>
      </Box>
    </Box>
  );
}

export async function viewCommand(idOrTicker: string, options: { verbose?: boolean }): Promise<void> {
  const saved = getAnalysis(idOrTicker);

  if (!saved) {
    const { waitUntilExit } = render(<NotFound query={idOrTicker} />);
    await waitUntilExit();
    return;
  }

  const { waitUntilExit } = render(
    <Box flexDirection="column">
      <Box padding={1} marginBottom={0}>
        <Text dimColor>Saved analysis from </Text>
        <Text>{new Date(saved.timestamp).toLocaleString()}</Text>
        <Text dimColor> (ID: {saved.id})</Text>
      </Box>
      <Results result={saved.result} verbose={options.verbose} elapsedTime={saved.elapsedTime} />
    </Box>
  );
  await waitUntilExit();
}
