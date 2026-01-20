import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { AnalysisResult, ModelAnalysis, Signal } from "../../data/types.js";
import { Header } from "./Header.js";
import { VerdictBox } from "./VerdictBox.js";
import { QuantHighlights } from "./QuantHighlights.js";
import { Scorecard } from "./Scorecard.js";
import { aggregateSignals, getAverageConfidence } from "../../agents/orchestrator.js";
import type { PersonaConfig } from "../../personas/types.js";
import { getPersonaSafe } from "../../personas/index.js";

interface ResultsProps {
  result: AnalysisResult;
  verbose?: boolean;
  elapsedTime?: number;
  persona?: PersonaConfig;
}

// Normalize percentage values - LLM sometimes returns 0.25 (25%) or 25 (25%)
function normalizePercent(value: number | undefined): number | undefined {
  if (value === undefined) return undefined;
  // If absolute value > 2, assume it's already a percentage (e.g., 25 means 25%)
  return Math.abs(value) > 2 ? value / 100 : value;
}

function countSignals(analyses: ModelAnalysis[]) {
  return analyses.reduce(
    (acc, a) => {
      // Count positive signals (bullish for Munger, disruptive for Cathie)
      if (a.signal === "bullish" || a.signal === "disruptive") acc.bullish++;
      // Count negative signals (bearish for Munger, legacy for Cathie)
      else if (a.signal === "bearish" || a.signal === "legacy") acc.bearish++;
      // Count neutral/stagnant signals
      else if (a.signal === "neutral" || a.signal === "stagnant") acc.neutral++;
      else acc.insufficient++;
      return acc;
    },
    { bullish: 0, bearish: 0, neutral: 0, insufficient: 0 }
  );
}

// Improved Signal Bar with inline counts
function SignalBar({ bullish, bearish, neutral, insufficient, persona }: {
  bullish: number;
  bearish: number;
  neutral: number;
  insufficient: number;
  persona: PersonaConfig;
}) {
  const total = bullish + bearish + neutral + insufficient;
  const width = 40;

  const bullishWidth = Math.round((bullish / total) * width);
  const bearishWidth = Math.round((bearish / total) * width);
  const neutralWidth = Math.round((neutral / total) * width);
  const insufficientWidth = Math.max(0, width - bullishWidth - bearishWidth - neutralWidth);

  // Persona-specific labels
  const labels = persona.id === "cathie"
    ? { positive: "disruptive", negative: "legacy", neutral: "stagnant" }
    : { positive: "bullish", negative: "bearish", neutral: "neutral" };

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
        {bullish} {labels.positive} · {bearish} {labels.negative} · {neutral} {labels.neutral} · {insufficient} n/a
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
  marginOfSafety: rawMarginOfSafety,
  oneLiner,
  persona,
}: {
  verdict: string;
  signals: { bullish: number; bearish: number; neutral: number; insufficientData: number };
  conviction: number;
  marginOfSafety?: number;
  oneLiner: string;
  persona: PersonaConfig;
}) {
  const verdictColor = persona.getVerdictColor(verdict);
  const marginOfSafety = normalizePercent(rawMarginOfSafety);

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
function ModelCard({ analysis, persona }: { analysis: ModelAnalysis; persona: PersonaConfig }) {
  const color = persona.getSignalColor(analysis.signal);
  const symbol = persona.getSignalSymbol(analysis.signal);

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
  color = "white",
  index,
  selectedIndex,
  persona,
}: {
  title: string;
  analyses: ModelAnalysis[];
  color?: string;
  index: number;
  selectedIndex: number | null;
  onToggle: (index: number) => void;
  persona: PersonaConfig;
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
            <ModelCard key={i} analysis={a} persona={persona} />
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

export function Results({ result, verbose = false, elapsedTime, persona }: ResultsProps) {
  const { ticker, financialData, agentOutputs, finalAnalysis } = result;
  const signals = aggregateSignals(agentOutputs);
  const avgConfidence = getAverageConfidence(agentOutputs);

  // Get persona from result or prop or default
  const resolvedPersona = persona || getPersonaSafe(result.personaId);

  // State for collapsible sections in verbose mode
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

  // Keyboard navigation for verbose mode - only active when verbose is true
  useInput(
    (input, key) => {
      const numGroups = resolvedPersona.agentGroups.length;
      if (input >= "1" && input <= String(numGroups)) {
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

  // Get first sentence of personaAnalysis for TL;DR
  // Use regex that doesn't split on decimal points (e.g., "$8.2 billion")
  const analysisText = finalAnalysis.personaAnalysis || finalAnalysis.whatCharlieWouldSay || "";
  const sentenceMatch = analysisText.match(/^[^.!?]*(?:\d+\.\d+[^.!?]*)*[.!?]/);
  const oneLiner = sentenceMatch ? sentenceMatch[0] : analysisText.slice(0, 150) + "...";

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
        persona={resolvedPersona}
      />

      <Divider label="Analysis" />

      {/* Signal Summary */}
      <Section title="Signal Distribution">
        <SignalBar
          bullish={signals.bullish}
          bearish={signals.bearish}
          neutral={signals.neutral}
          insufficient={signals.insufficientData}
          persona={resolvedPersona}
        />
      </Section>

      {/* Persona's Verdict - full version */}
      <VerdictBox
        verdict={finalAnalysis.verdict}
        personaAnalysis={finalAnalysis.personaAnalysis || finalAnalysis.whatCharlieWouldSay || ""}
        conviction={avgConfidence}
        persona={resolvedPersona}
      />

      {/* Key Numbers */}
      <QuantHighlights
        keyNumbers={finalAnalysis.keyNumbers}
        currentPrice={financialData.price}
      />

      <Divider label="Category Insights" />

      {/* Category Insights - dynamically from persona */}
      <Box flexDirection="column" gap={1}>
        {resolvedPersona.categories.map(({ key, label, color }) => {
          const insight = (finalAnalysis.categoryInsights as unknown as Record<string, string>)[key];
          return (
            <Box key={key} flexDirection="column">
              <Text color={color} bold>▸ {label}</Text>
              <Box paddingLeft={2}>
                <Text wrap="wrap" color="gray">
                  {insight || "No insight available"}
                </Text>
              </Box>
            </Box>
          );
        })}
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
            <Text dimColor>Press 1-{resolvedPersona.agentGroups.length} to expand/collapse groups, ↑↓ to navigate, ESC to close</Text>
          </Box>

          {resolvedPersona.agentGroups.map((group, index) => (
            <CollapsibleModelGroup
              key={group.title}
              title={group.title}
              analyses={getAnalysesForGroup(group.agentIds)}
              color={group.color}
              index={index}
              selectedIndex={expandedGroup}
              onToggle={setExpandedGroup}
              persona={resolvedPersona}
            />
          ))}
        </>
      )}

      {/* Footer */}
      <Divider />
      <Box>
        <Text dimColor>
          {agentOutputs.length} agents · {resolvedPersona.displayName} · {Math.round(avgConfidence * 100)}% avg confidence
          {elapsedTime && ` · ${Math.round(elapsedTime / 1000)}s`}
        </Text>
      </Box>
    </Box>
  );
}
