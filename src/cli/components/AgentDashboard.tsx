import React, { useState } from "react";
import { Box, Text, useStdout, Spacer, useInput } from "ink";
import Spinner from "ink-spinner";

export type AgentStatus = "pending" | "thinking" | "tool_call" | "done" | "error";

export interface AgentState {
  id: number;
  name: string;
  status: AgentStatus;
  currentTool?: string;
  toolCalls: number;
  inputTokens: number;
  outputTokens: number;
  mentalModels: string[];
  completedModels: number;
  error?: string;
}

// Claude Sonnet 4.5 pricing
const INPUT_COST_PER_MTOK = 1.50;
const OUTPUT_COST_PER_MTOK = 7.50;

function calculateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * INPUT_COST_PER_MTOK +
         (outputTokens / 1_000_000) * OUTPUT_COST_PER_MTOK;
}

function formatCost(cost: number): string {
  if (cost < 0.01) return `$${(cost * 100).toFixed(2)}¢`;
  return `$${cost.toFixed(2)}`;
}

function formatTokens(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}m`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return `${count}`;
}

interface AgentCardProps {
  agent: AgentState;
  width: number;
  compact?: boolean;
  selected?: boolean;
}

function getStatusColor(status: AgentStatus): string {
  switch (status) {
    case "pending":
      return "gray";
    case "thinking":
      return "cyan";
    case "tool_call":
      return "yellow";
    case "done":
      return "green";
    case "error":
      return "red";
  }
}

function getStatusIcon(status: AgentStatus): React.ReactNode {
  switch (status) {
    case "pending":
      return <Text color="gray">○</Text>;
    case "thinking":
      return <Text color="cyan"><Spinner type="dots" /></Text>;
    case "tool_call":
      return <Text color="yellow"><Spinner type="arc" /></Text>;
    case "done":
      return <Text color="green">✓</Text>;
    case "error":
      return <Text color="red">✗</Text>;
  }
}

function AgentCard({ agent, width, compact = false, selected = false }: AgentCardProps) {
  const statusColor = getStatusColor(agent.status);
  const borderColor = selected ? "magenta" : statusColor;

  // Truncate name to fit
  const maxNameLen = width - 4;
  const shortName = agent.name.length > maxNameLen
    ? agent.name.slice(0, maxNameLen - 2) + ".."
    : agent.name;

  // Truncate tool name
  const maxToolLen = width - 4;
  const toolDisplay = agent.currentTool
    ? (agent.currentTool.length > maxToolLen
        ? agent.currentTool.slice(0, maxToolLen - 1) + "…"
        : agent.currentTool)
    : "";

  if (compact) {
    return (
      <Box
        flexDirection="column"
        width={width}
        height={5}
        borderStyle={selected ? "double" : "round"}
        borderColor={borderColor}
        paddingX={1}
      >
        <Box>
          {getStatusIcon(agent.status)}
          <Text bold color={statusColor}> {agent.id}</Text>
          {selected && <Text color="magenta"> ◀</Text>}
        </Box>
        <Box height={1}>
          {agent.status === "tool_call" && <Text color="yellow" wrap="truncate">→ {toolDisplay}</Text>}
          {agent.status === "thinking" && <Text color="cyan">Analyzing</Text>}
          {agent.status === "done" && <Text color="green">Done</Text>}
          {agent.status === "pending" && <Text color="gray">Waiting</Text>}
          {agent.status === "error" && <Text color="red">Error</Text>}
        </Box>
        <Box justifyContent="space-between">
          <Text dimColor>{agent.toolCalls} calls</Text>
          <Box>
            {agent.mentalModels.map((_, i) => (
              <Text key={i} color={i < agent.completedModels ? "green" : "gray"}>
                {i < agent.completedModels ? "█" : "░"}
              </Text>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      width={width}
      height={8}
      borderStyle={selected ? "double" : "round"}
      borderColor={borderColor}
      paddingX={1}
    >
      {/* Header */}
      <Box>
        {getStatusIcon(agent.status)}
        <Text bold color={statusColor}> Agent {agent.id}</Text>
        {selected && <Text color="magenta"> ◀</Text>}
      </Box>

      {/* Agent Name */}
      <Text dimColor wrap="truncate">{shortName}</Text>

      {/* Status Line */}
      <Box height={1}>
        {agent.status === "thinking" && (
          <Text color="cyan" wrap="truncate">Analyzing...</Text>
        )}
        {agent.status === "tool_call" && agent.currentTool && (
          <Text color="yellow" wrap="truncate">→ {toolDisplay}</Text>
        )}
        {agent.status === "done" && (
          <Text color="green">Complete</Text>
        )}
        {agent.status === "error" && (
          <Text color="red" wrap="truncate">{agent.error || "Failed"}</Text>
        )}
        {agent.status === "pending" && (
          <Text color="gray">Waiting...</Text>
        )}
      </Box>

      {/* Stats + Progress */}
      <Box justifyContent="space-between">
        <Text dimColor>
          {agent.toolCalls} calls · {agent.inputTokens + agent.outputTokens > 0
            ? `${formatTokens(agent.inputTokens + agent.outputTokens)} · ${formatCost(calculateCost(agent.inputTokens, agent.outputTokens))}`
            : "-"}
        </Text>
        <Box>
          {agent.mentalModels.map((_, i) => (
            <Text key={i} color={i < agent.completedModels ? "green" : "gray"}>
              {i < agent.completedModels ? "█" : "░"}
            </Text>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

interface AgentDetailPanelProps {
  agent: AgentState;
  onClose: () => void;
}

function AgentDetailPanel({ agent, onClose }: AgentDetailPanelProps) {
  const statusColor = getStatusColor(agent.status);

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="magenta"
      paddingX={2}
      paddingY={1}
      marginTop={1}
    >
      <Box marginBottom={1}>
        <Text bold color="magenta">Agent {agent.id}: </Text>
        <Text bold>{agent.name}</Text>
        <Spacer />
        <Text dimColor>[ESC to close]</Text>
      </Box>

      <Box gap={4}>
        <Box flexDirection="column">
          <Text dimColor>Status</Text>
          <Box>
            {getStatusIcon(agent.status)}
            <Text color={statusColor}> {agent.status}</Text>
          </Box>
        </Box>

        <Box flexDirection="column">
          <Text dimColor>Tool Calls</Text>
          <Text bold>{agent.toolCalls}</Text>
        </Box>

        <Box flexDirection="column">
          <Text dimColor>Tokens</Text>
          <Text bold>{agent.inputTokens + agent.outputTokens > 0 ? formatTokens(agent.inputTokens + agent.outputTokens) : "-"}</Text>
        </Box>

        <Box flexDirection="column">
          <Text dimColor>Cost</Text>
          <Text bold color="yellow">{agent.inputTokens + agent.outputTokens > 0 ? formatCost(calculateCost(agent.inputTokens, agent.outputTokens)) : "-"}</Text>
        </Box>

        <Box flexDirection="column">
          <Text dimColor>Progress</Text>
          <Text bold>{agent.completedModels}/{agent.mentalModels.length} models</Text>
        </Box>
      </Box>

      {agent.currentTool && (
        <Box marginTop={1}>
          <Text dimColor>Current: </Text>
          <Text color="yellow">{agent.currentTool}</Text>
        </Box>
      )}

      <Box flexDirection="column" marginTop={1}>
        <Text dimColor>Mental Models:</Text>
        <Box flexWrap="wrap" gap={1}>
          {agent.mentalModels.map((model, i) => (
            <Text key={model} color={i < agent.completedModels ? "green" : "gray"}>
              {i < agent.completedModels ? "✓" : "○"} {model}
            </Text>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

interface AgentDashboardProps {
  agents: AgentState[];
  ticker: string;
  elapsedTime: number;
  phase: "fetching" | "analyzing" | "synthesizing" | "complete";
}

export function AgentDashboard({ agents, ticker, elapsedTime, phase }: AgentDashboardProps) {
  const { stdout } = useStdout();
  const termWidth = stdout?.columns || 120;
  const termHeight = stdout?.rows || 40;

  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  // Keyboard navigation
  useInput((input, key) => {
    if (input >= "1" && input <= "9") {
      setSelectedAgent(parseInt(input));
    }
    if (input === "0") {
      setSelectedAgent(10);
    }
    if (key.escape) {
      setSelectedAgent(null);
    }
    // Arrow key navigation
    if (selectedAgent !== null) {
      if (key.leftArrow && selectedAgent > 1) {
        setSelectedAgent(selectedAgent - 1);
      }
      if (key.rightArrow && selectedAgent < 10) {
        setSelectedAgent(selectedAgent + 1);
      }
      if (key.upArrow && selectedAgent > 5) {
        setSelectedAgent(selectedAgent - 5);
      }
      if (key.downArrow && selectedAgent <= 5) {
        setSelectedAgent(selectedAgent + 5);
      }
    }
  });

  const completedCount = agents.filter(a => a.status === "done").length;
  const totalToolCalls = agents.reduce((sum, a) => sum + a.toolCalls, 0);
  const totalInputTokens = agents.reduce((sum, a) => sum + a.inputTokens, 0);
  const totalOutputTokens = agents.reduce((sum, a) => sum + a.outputTokens, 0);
  const totalTokens = totalInputTokens + totalOutputTokens;
  const totalCost = calculateCost(totalInputTokens, totalOutputTokens);

  // Calculate card width based on terminal width (5 columns with gaps)
  const gap = 1;
  const padding = 2;
  const availableWidth = termWidth - padding * 2;
  const cardWidth = Math.floor((availableWidth - gap * 4) / 5);

  // Use compact mode if terminal is small or detail panel is open
  const compact = termHeight < 35 || cardWidth < 22 || selectedAgent !== null;

  // Split agents into 2 rows of 5
  const topRow = agents.slice(0, 5);
  const bottomRow = agents.slice(5, 10);

  const selectedAgentData = selectedAgent !== null
    ? agents.find(a => a.id === selectedAgent)
    : null;

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box
        borderStyle="double"
        borderColor="magenta"
        paddingX={2}
        paddingY={compact ? 0 : 1}
        marginBottom={1}
      >
        <Box gap={2}>
          <Text bold color="magenta">LATTICE</Text>
          <Text bold>{ticker}</Text>
          <Text color="gray">│</Text>
          {phase === "fetching" && <><Text color="yellow"><Spinner type="dots" /></Text><Text> Fetching data...</Text></>}
          {phase === "analyzing" && <><Text color="cyan"><Spinner type="dots" /></Text><Text> Agents working ({completedCount}/10)</Text></>}
          {phase === "synthesizing" && <><Text color="magenta"><Spinner type="dots" /></Text><Text> Charlie synthesizing...</Text></>}
          {phase === "complete" && <Text color="green">✓ Complete</Text>}
        </Box>
        <Spacer />
        <Box gap={3}>
          {!compact && (
            <>
              <Text dimColor>Tokens: <Text color="white">{totalTokens > 0 ? formatTokens(totalTokens) : "-"}</Text></Text>
              <Text dimColor>Cost: <Text color="yellow">{totalTokens > 0 ? formatCost(totalCost) : "-"}</Text></Text>
            </>
          )}
          <Text color="gray">{Math.floor(elapsedTime / 1000)}s</Text>
        </Box>
      </Box>

      {/* Agent Grid - 5 columns x 2 rows */}
      <Box flexDirection="column" flexGrow={1}>
        {/* Top Row */}
        <Box gap={gap} marginBottom={1}>
          {topRow.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              width={cardWidth}
              compact={compact}
              selected={agent.id === selectedAgent}
            />
          ))}
        </Box>

        {/* Bottom Row */}
        <Box gap={gap}>
          {bottomRow.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              width={cardWidth}
              compact={compact}
              selected={agent.id === selectedAgent}
            />
          ))}
        </Box>
      </Box>

      {/* Detail Panel */}
      {selectedAgentData && (
        <AgentDetailPanel
          agent={selectedAgentData}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      {/* Footer */}
      <Box marginTop={1} justifyContent="space-between">
        <Box gap={4}>
          <Text dimColor>
            {completedCount}/10 agents complete
          </Text>
          <Text dimColor>
            28 mental models
          </Text>
        </Box>
        <Text dimColor>Press 1-0 to inspect agent • ESC to close • ←→↑↓ to navigate</Text>
      </Box>
    </Box>
  );
}
