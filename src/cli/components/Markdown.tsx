import React from "react";
import { Text } from "ink";
import { marked } from "marked";
// @ts-expect-error - types are outdated for marked-terminal v7
import { markedTerminal } from "marked-terminal";

interface MarkdownProps {
  children: string;
}

// Configure marked to use terminal renderer
marked.use(
  markedTerminal({
    reflowText: true,
    width: 80,
  })
);

export function Markdown({ children }: MarkdownProps) {
  const rendered = marked.parse(children, { async: false }) as string;
  return <Text>{rendered.trim()}</Text>;
}
