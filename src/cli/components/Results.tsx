import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { AnalysisResult, ModelAnalysis, Signal } from "../../data/types.js";
import { Header } from "./Header.js";
import { VerdictBox } from "./VerdictBox.js";
import { QuantHighlights } from "./QuantHighlights.js";
import { Scorecard } from "./Scorecard.js";
import { aggregateSignals, getAverageConfidence } from "../../agents/orchestrator.js";

interface ResultsProps {
  result: AnalysisResult;
  verbose?: boolean;
  elapsedTime?: number;
}

// Category configuration for DRY iteration
const CATEGORIES = [
  { key: "coreInvestment", label: "Core Investment", color: "cyan" },
  { key: "psychologyBehavioral", label: "Psychology", color: "magenta" },
  { key: "mathProbability", label: "Math & Probability", color: "blue" },
  { key: "economicsBusiness", label: "Economics", color: "yellow" },
  { key: "systemsThinking", label: "Systems", color: "green" },
  { key: "decisionFilters", label: "Decision Filters", color: "white" },
] as const;

// Agent groupings for model analysis sections
const AGENT_GROUPS = [
  { title: "Core Investment Principles", agentIds: [1], color: "cyan" },
  { title: "Moats & Ownership Quality", agentIds: [2], color: "cyan" },
  { title: "Psychology & Behavioral", agentIds: [3, 4], color: "magenta" },
  { title: "Lollapalooza Effects", agentIds: [5], color: "magenta" },
  { title: "Math & Probability", agentIds: [6, 7], color: "blue" },
  { title: "Economics & Business", agentIds: [8], color: "yellow" },
  { title: "Systems Thinking", agentIds: [9], color: "green" },
  { title: "Decision Filters", agentIds: [10], color: "white" },
] as const;

function getSignalColor(signal: Signal): string {
  switch (signal) {
    case "bullish": return "green";
    case "bearish": return "red";
    case "neutral": return "yellow";
    case "insufficient_data": return "gray";
    default: return "white";
  }
}

function getSignalSymbol(signal: Signal): string {
  switch (signal) {
    case "bullish": return "+";
    case "bearish": return "-";
    case "neutral": return "~";
    case "insufficient_data": return "?";
    default: return " ";
  }
}

function countSignals(analyses: ModelAnalysis[]) {
  return analyses.reduce(
    (acc, a) => {
      if (a.signal === "bullish") acc.bullish++;
      else if (a.signal === "bearish") acc.bearish++;
      else if (a.signal === "neutral") acc.neutral++;
      else acc.insufficient++;
      return acc;
    },
    { bullish: 0, bearish: 0, neutral: 0, insufficient: 0 }
  );
}

// Improved Signal Bar with inline counts
function SignalBar({ bullish, bearish, neutral, insufficient }: {
  bullish: number;
  bearish: number;
  neutral: number;
  insufficient: number;
}) {
  const total = bullish + bearish + neutral + insufficient;
  const width = 40;

  const bullishWidth = Math.round((bullish / total) * width);
  const bearishWidth = Math.round((bearish / total) * width);
  const neutralWidth = Math.round((neutral / total) * width);
  const insufficientWidth = Math.max(0, width - bullishWidth - bearishWidth - neutralWidth);

  return (
    <Box flexDirection="column" gap={1}>
      {/* Visual bar with inline counts */}
      <Box>
        {bullish > 0 && (
          <>
            <Text color="green">{"█".repeat(bullishWidth)}</Text>
            <Text color="green" dimColor> {bullish}</Text>
          </>
        )}
        {bearish > 0 && (
          <>
            <Text color="red">{"█".repeat(bearishWidth)}</Text>
            <Text color="red" dimColor> {bearish}</Text>
          </>
        )}
        {neutral > 0 && (
          <>
            <Text color="yellow">{"█".repeat(neutralWidth)}</Text>
            <Text color="yellow" dimColor> {neutral}</Text>
          </>
        )}
        {insufficient > 0 && (
          <>
            <Text color="gray">{"░".repeat(insufficientWidth)}</Text>
            <Text color="gray" dimColor> {insufficient}</Text>
          </>
        )}
      </Box>

      {/* Legend on one line */}
      <Text dimColor>
        {bullish} bullish · {bearish} bearish · {neutral} neutral · {insufficient} n/a
      </Text>
    </Box>
  );
}

// Contextual divider
function Divider({ label }: { label?: string }) {
  if (label) {
    return (
      <Box marginY={1}>
        <Text dimColor>{"─".repeat(4)} </Text>
        <Text dimColor bold>{label}</Text>
        <Text dimColor> {"─".repeat(48)}</Text>
      </Box>
    );
  }
  return (
    <Box marginY={1}>
      <Text dimColor>{"─".repeat(60)}</Text>
    </Box>
  );
}

// TL;DR Summary Box
function TLDRBox({
  verdict,
  signals,
  conviction,
  marginOfSafety,
  oneLiner,
}: {
  verdict: string;
  signals: { bullish: number; bearish: number; neutral: number; insufficientData: number };
  conviction: number;
  marginOfSafety?: number;
  oneLiner: string;
}) {
  const verdictColor = verdict.includes("BUY") ? "green"
    : verdict.includes("SELL") ? "red"
    : verdict === "TOO HARD" ? "gray"
    : "yellow";

  return (
    <Box
      borderStyle="double"
      borderColor={verdictColor}
      paddingX={2}
      paddingY={1}
      flexDirection="column"
      marginY={1}
    >
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color={verdictColor}>{verdict}</Text>
        <Box gap={2}>
          <Text color="green">{signals.bullish}+</Text>
          <Text color="red">{signals.bearish}-</Text>
          <Text dimColor>({signals.bullish + signals.bearish + signals.neutral + signals.insufficientData} signals)</Text>
        </Box>
      </Box>

      <Text italic wrap="wrap">"{oneLiner}"</Text>

      <Box marginTop={1} gap={4}>
        <Box>
          <Text dimColor>Conviction: </Text>
          <Text color={conviction > 0.7 ? "green" : conviction > 0.4 ? "yellow" : "red"}>
            {"●".repeat(Math.round(conviction * 5))}
            {"○".repeat(5 - Math.round(conviction * 5))}
          </Text>
          <Text dimColor> {Math.round(conviction * 100)}%</Text>
        </Box>
        {marginOfSafety !== undefined && (
          <Box>
            <Text dimColor>MoS: </Text>
            <Text color={marginOfSafety > 0.25 ? "green" : marginOfSafety > 0 ? "yellow" : "red"}>
              {(marginOfSafety * 100).toFixed(0)}%
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Improved ModelCard with signal leading
function ModelCard({ analysis, compact = false }: { analysis: ModelAnalysis; compact?: boolean }) {
  const color = getSignalColor(analysis.signal);
  const symbol = getSignalSymbol(analysis.signal);

  if (compact) {
    return (
      <Box gap={1}>
        <Text color={color}>{symbol}</Text>
        <Text>{analysis.modelName}</Text>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={color}
      paddingX={1}
      marginY={1}
    >
      {/* Header row */}
      <Box justifyContent="space-between">
        <Text color={color} bold>{symbol} {analysis.modelName}</Text>
        <Text color={color}>{analysis.signal}</Text>
      </Box>

      {/* Assessment */}
      <Text wrap="wrap" dimColor>{analysis.assessment}</Text>

      {/* Key factors */}
      {analysis.keyFactors.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          {analysis.keyFactors.slice(0, 3).map((factor, i) => (
            <Text key={i} dimColor>• {factor}</Text>
          ))}
        </Box>
      )}
    </Box>
  );
}

// Collapsible Model Group
function CollapsibleModelGroup({
  title,
  analyses,
  defaultExpanded = false,
  color = "white",
  index,
  selectedIndex,
  onToggle,
}: {
  title: string;
  analyses: ModelAnalysis[];
  defaultExpanded?: boolean;
  color?: string;
  index: number;
  selectedIndex: number | null;
  onToggle: (index: number) => void;
}) {
  const isExpanded = selectedIndex === index;
  const signals = countSignals(analyses);
  const isSelected = selectedIndex === index;

  if (analyses.length === 0) return null;

  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text color={isSelected ? color : "white"} bold>
          {isExpanded ? "▼" : "▸"} {title}
        </Text>
        <Text dimColor> ({analyses.length}: </Text>
        <Text color="green">{signals.bullish}+</Text>
        <Text dimColor>/</Text>
        <Text color="red">{signals.bearish}-</Text>
        <Text dimColor>/</Text>
        <Text color="yellow">{signals.neutral}~</Text>
        <Text dimColor>)</Text>
      </Box>

      {isExpanded && (
        <Box flexDirection="column" paddingLeft={2}>
          {analyses.map((a, i) => (
            <ModelCard key={i} analysis={a} />
          ))}
        </Box>
      )}
    </Box>
  );
}

// Section component
function Section({ title, children, color = "white" }: {
  title: string;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <Box flexDirection="column" marginY={1}>
      <Box marginBottom={1}>
        <Text color={color} bold>{title}</Text>
      </Box>
      {children}
    </Box>
  );
}

export function Results({ result, verbose = false, elapsedTime }: ResultsProps) {
  const { ticker, financialData, agentOutputs, finalAnalysis } = result;
  const signals = aggregateSignals(agentOutputs);
  const avgConfidence = getAverageConfidence(agentOutputs);

  // State for collapsible sections in verbose mode
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

  // Keyboard navigation for verbose mode - only active when verbose is true
  useInput(
    (input, key) => {
      const numGroups = AGENT_GROUPS.length;
      if (input >= "1" && input <= "8") {
        const idx = parseInt(input) - 1;
        setExpandedGroup(expandedGroup === idx ? null : idx);
      }
      if (key.escape) {
        setExpandedGroup(null);
      }
      if (key.downArrow && expandedGroup !== null && expandedGroup < numGroups - 1) {
        setExpandedGroup(expandedGroup + 1);
      }
      if (key.upArrow && expandedGroup !== null && expandedGroup > 0) {
        setExpandedGroup(expandedGroup - 1);
      }
    },
    { isActive: verbose }
  );

  // Get first sentence of whatCharlieWouldSay for TL;DR
  const oneLiner = finalAnalysis.whatCharlieWouldSay.split(/[.!?]/)[0] + ".";

  // Group analyses by agent
  const getAnalysesForGroup = (agentIds: readonly number[]) =>
    agentOutputs
      .filter((o) => agentIds.includes(o.agentId))
      .flatMap((o) => o.analyses);

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Header
        ticker={ticker}
        companyName={financialData.companyName}
        sector={financialData.sector}
        industry={financialData.industry}
        marketCap={financialData.marketCap}
        price={financialData.price}
        change={financialData.change}
      />

      {/* TL;DR Box */}
      <TLDRBox
        verdict={finalAnalysis.verdict}
        signals={signals}
        conviction={avgConfidence}
        marginOfSafety={finalAnalysis.keyNumbers?.marginOfSafety}
        oneLiner={oneLiner}
      />

      <Divider label="Analysis" />

      {/* Signal Summary */}
      <Section title="Signal Distribution">
        <SignalBar
          bullish={signals.bullish}
          bearish={signals.bearish}
          neutral={signals.neutral}
          insufficient={signals.insufficientData}
        />
      </Section>

      {/* Charlie's Verdict - full version */}
      <VerdictBox
        verdict={finalAnalysis.verdict}
        whatCharlieWouldSay={finalAnalysis.whatCharlieWouldSay}
        conviction={avgConfidence}
      />

      {/* Key Numbers */}
      <QuantHighlights
        keyNumbers={finalAnalysis.keyNumbers}
        currentPrice={financialData.price}
      />

      <Divider label="Category Insights" />

      {/* Category Insights - DRY loop */}
      <Box flexDirection="column" gap={1}>
        {CATEGORIES.map(({ key, label, color }) => (
          <Box key={key} flexDirection="column">
            <Text color={color} bold>▸ {label}</Text>
            <Box paddingLeft={2}>
              <Text wrap="wrap" color="gray">
                {finalAnalysis.categoryInsights[key as keyof typeof finalAnalysis.categoryInsights]}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Summary Scorecard */}
      <Divider label="Summary Scorecard" />
      <Scorecard
        analyses={agentOutputs.flatMap((o) => o.analyses)}
        ticker={ticker}
      />

      {/* Red Flags */}
      {finalAnalysis.redFlags.length > 0 && (
        <>
          <Divider label="Warnings" />
          <Section title="Red Flags" color="red">
            {finalAnalysis.redFlags.map((flag, i) => (
              <Box key={i}>
                <Text color="red">! </Text>
                <Text wrap="wrap" color="red">{flag}</Text>
              </Box>
            ))}
          </Section>
        </>
      )}

      {/* What Would Make This Better */}
      {finalAnalysis.whatWouldMakeThisBetter.length > 0 && (
        <Section title="What Would Improve This">
          {finalAnalysis.whatWouldMakeThisBetter.map((item, i) => (
            <Box key={i}>
              <Text color="gray">• </Text>
              <Text wrap="wrap" color="gray">{item}</Text>
            </Box>
          ))}
        </Section>
      )}

      {/* Detailed Analysis (verbose mode) - Collapsible */}
      {verbose && (
        <>
          <Divider label="Detailed Mental Model Analysis" />
          <Box marginBottom={1}>
            <Text dimColor>Press 1-8 to expand/collapse groups, ↑↓ to navigate, ESC to close</Text>
          </Box>

          {AGENT_GROUPS.map((group, index) => (
            <CollapsibleModelGroup
              key={group.title}
              title={group.title}
              analyses={getAnalysesForGroup(group.agentIds)}
              color={group.color}
              index={index}
              selectedIndex={expandedGroup}
              onToggle={setExpandedGroup}
            />
          ))}
        </>
      )}

      {/* Footer */}
      <Divider />
      <Box>
        <Text dimColor>
          {agentOutputs.length} agents · 28 mental models · {Math.round(avgConfidence * 100)}% avg confidence
          {elapsedTime && ` · ${Math.round(elapsedTime / 1000)}s`}
        </Text>
      </Box>
    </Box>
  );
}
