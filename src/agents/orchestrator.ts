import Anthropic from "@anthropic-ai/sdk";
import type { AgentConfig } from "./agentConfigs/types.js";
import { allAgentConfigs } from "./agentConfigs/index.js";
import {
  exaSearchToolDefinition,
  handleExaSearch,
  type ExaSearchInput,
} from "./tools/exaSearch.js";
import { formatFinvizDataForPrompt } from "../data/finvizScraper.js";
import type { FinvizData, AgentOutput, Signal, Grade, ModelAnalysis } from "../data/types.js";
import type { LatticeConfig } from "../utils/config.js";

import * as fs from "fs";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 8192;
const MAX_TURNS = 10;
const VERBOSE = process.env.LATTICE_VERBOSE === "1";
const DEBUG_FILE = process.env.LATTICE_DEBUG_FILE || "/tmp/lattice-debug.log";

function debugLog(message: string) {
  if (VERBOSE) {
    fs.appendFileSync(DEBUG_FILE, `${new Date().toISOString()} ${message}\n`);
  }
}

function buildAgentPrompt(
  config: AgentConfig,
  ticker: string,
  data: FinvizData
): string {
  const modelsArray = config.models.map(m => `"${m}"`).join(", ");

  return `# Stock Analysis: ${ticker} (${data.companyName})

## Context
You are one of 10 specialist analysts contributing to a comprehensive Munger-style investment analysis. Your insights will be synthesized by a "Charlie Munger" persona who will deliver the final verdict. Write for a sophisticated investor who values specificity over generalities.

## Your Assigned Mental Models
${config.models.map((m, i) => `${i + 1}. ${m}`).join("\n")}

## Financial Data

${formatFinvizDataForPrompt(data)}

## Instructions

1. **Analyze through each mental model**: Apply each of your ${config.models.length} assigned models to this specific company. Reference actual numbers from the data.

2. **Use tools strategically**:
   - \`code_execution\`: Use for DCF calculations, sensitivity analysis, scenario modeling, or statistical analysis. The sandbox has Python with pandas, numpy, scipy.
   - \`exa_search\`: Use ONLY if you need information not in the financial data (recent news, competitive moves, regulatory changes). Most analyses won't need this.

3. **Assign signals based on clear criteria**:
   - \`bullish\`: Evidence strongly favors investment (e.g., significant undervaluation, strong moat, favorable trends)
   - \`bearish\`: Evidence argues against investment (e.g., overvaluation, deteriorating position, major risks)
   - \`neutral\`: Mixed or balanced evidence, no clear directional lean
   - \`insufficient_data\`: Cannot form a view due to missing critical information

4. **Assign letter grades (A+ to F)** for each mental model based on how the company scores:
   - A+/A/A-: Excellent (top decile for this factor)
   - B+/B/B-: Good (above average)
   - C+/C/C-: Average or mixed
   - D+/D/D-: Below average / concerning
   - F: Failing / major red flag
   Include a brief 3-8 word note explaining the grade.

5. **Be specific**: Cite actual metrics. "P/E of 33.5x is 50% above the 5-year average of 22x" not "valuation is high."

6. **Acknowledge uncertainty**: State what you don't know. Munger values intellectual honesty.

## Example Output

<example>
For a company with P/E of 25x, ROE of 30%, and 15% revenue growth:

{
  "analyses": [
    {
      "modelName": "Circle of Competence",
      "assessment": "SaaS business model is straightforward: recurring subscription revenue with 95%+ gross margins. Unit economics are transparent (CAC of $500, LTV of $5,000, 10:1 ratio). The only complexity is enterprise deal cycles, which can extend 6-12 months. Core value drivers (retention, expansion revenue, sales efficiency) are measurable and trackable. This falls clearly within a generalist investor's competence circle.",
      "signal": "bullish",
      "grade": "B+",
      "gradeNote": "Understandable but operationally complex",
      "keyFactors": [
        "Simple recurring revenue model with visible metrics",
        "Unit economics easily verifiable from public filings",
        "No specialized industry knowledge required"
      ]
    }
  ],
  "confidence": 0.75,
  "dataGaps": ["Customer concentration data not available", "Contract duration mix unclear"]
}
</example>

## Required Output Format

Return a JSON object with EXACTLY this structure. The "analyses" array must contain exactly ${config.models.length} objects, one for each model: ${modelsArray}

{
  "analyses": [
    {
      "modelName": "EXACT_MODEL_NAME",
      "assessment": "4-6 sentences with specific evidence from the data",
      "signal": "bullish|bearish|neutral|insufficient_data",
      "grade": "A+|A|A-|B+|B|B-|C+|C|C-|D+|D|D-|F",
      "gradeNote": "3-8 word explanation of grade",
      "keyFactors": ["specific factor 1", "specific factor 2", "specific factor 3"]
    }
  ],
  "confidence": 0.0 to 1.0,
  "dataGaps": ["specific missing information"]
}`;
}

interface AgentRunResult {
  output: AgentOutput;
  totalInputTokens: number;
  totalOutputTokens: number;
}

async function runSingleAgent(
  client: Anthropic,
  config: AgentConfig,
  ticker: string,
  data: FinvizData,
  mungerConfig: LatticeConfig,
  onTurnProgress?: (turn: number, action: string, inputTokens?: number, outputTokens?: number) => void
): Promise<AgentRunResult> {
  const tools: Anthropic.Messages.Tool[] = [
    exaSearchToolDefinition as Anthropic.Messages.Tool,
  ];

  // Use unknown[] to avoid type issues with beta API
  const messages: Array<{role: "user" | "assistant", content: unknown}> = [
    { role: "user", content: buildAgentPrompt(config, ticker, data) },
  ];

  let turns = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  while (turns < MAX_TURNS) {
    turns++;
    onTurnProgress?.(turns, "Thinking...", totalInputTokens, totalOutputTokens);

    const response = await client.beta.messages.create({
      model: MODEL,
      betas: ["code-execution-2025-08-25", "structured-outputs-2025-11-13"],
      max_tokens: MAX_TOKENS,
      system: config.systemPrompt,
      tools: [
        { type: "code_execution_20250825", name: "code_execution" } as unknown as Anthropic.Messages.Tool,
        ...tools,
      ],
      messages: messages as Anthropic.Messages.MessageParam[],
      // Structured outputs - guarantees valid JSON matching schema
      output_format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            analyses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  modelName: { type: "string" },
                  assessment: { type: "string" },
                  signal: { type: "string", enum: ["bullish", "bearish", "neutral", "insufficient_data"] },
                  grade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] },
                  gradeNote: { type: "string" },
                  keyFactors: { type: "array", items: { type: "string" } },
                },
                required: ["modelName", "assessment", "signal", "grade", "gradeNote", "keyFactors"],
                additionalProperties: false,
              },
            },
            confidence: { type: "number" },
            dataGaps: { type: "array", items: { type: "string" } },
          },
          required: ["analyses", "confidence", "dataGaps"],
          additionalProperties: false,
        },
      },
    } as unknown as Anthropic.Beta.Messages.MessageCreateParamsNonStreaming) as Anthropic.Beta.Messages.BetaMessage;

    // Track token usage from response
    const usage = response.usage as { input_tokens: number; output_tokens: number } | undefined;
    if (usage) {
      totalInputTokens += usage.input_tokens;
      totalOutputTokens += usage.output_tokens;
    }

    // Check for tool use
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.Messages.ToolUseBlock =>
        block.type === "tool_use"
    );

    if (toolUseBlocks.length > 0) {
      // Handle tool calls
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        if (toolUse.name === "exa_search") {
          onTurnProgress?.(turns, "Web search...", totalInputTokens, totalOutputTokens);
          const result = await handleExaSearch(
            toolUse.input as ExaSearchInput,
            mungerConfig
          );
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: result,
          });
        } else if (toolUse.name === "code_execution") {
          onTurnProgress?.(turns, "Running code...", totalInputTokens, totalOutputTokens);
        }
        // code_execution is handled automatically by the API
      }

      // If we have tool results to send back, continue the conversation
      if (toolResults.length > 0) {
        messages.push({ role: "assistant", content: response.content });
        messages.push({ role: "user", content: toolResults });
        continue;
      }

      // If only code_execution was used (handled by API), check if we have final output
      if (response.stop_reason === "end_turn") {
        onTurnProgress?.(turns, "Done", totalInputTokens, totalOutputTokens);
        return {
          output: parseAgentOutput(response, config, VERBOSE),
          totalInputTokens,
          totalOutputTokens,
        };
      }

      // Continue if there might be more tool use
      messages.push({ role: "assistant", content: response.content });
      continue;
    }

    // No tool use - should be final response
    if (response.stop_reason === "end_turn") {
      onTurnProgress?.(turns, "Done", totalInputTokens, totalOutputTokens);
      return {
        output: parseAgentOutput(response, config, VERBOSE),
        totalInputTokens,
        totalOutputTokens,
      };
    }

    // Unexpected stop reason
    break;
  }

  // Fallback if we couldn't get a proper response
  return {
    output: createFallbackOutput(config),
    totalInputTokens,
    totalOutputTokens,
  };
}

function parseAgentOutput(
  response: Anthropic.Beta.Messages.BetaMessage,
  config: AgentConfig,
  verbose = false
): AgentOutput {
  // Find text content in the response (handle both regular and beta content blocks)
  const textBlocks: Array<{ text: string }> = [];

  for (const block of response.content) {
    if (block.type === "text") {
      textBlocks.push({ text: (block as { type: "text"; text: string }).text });
    }
  }

  if (textBlocks.length === 0) {
    if (verbose) {
      debugLog(`Agent ${config.id} (${config.name}): No text blocks found in response`);
      debugLog(`Response content types: ${response.content.map(b => b.type).join(', ')}`);
    }
    return createFallbackOutput(config);
  }

  const text = textBlocks.map((b) => b.text).join("\n");

  if (verbose) {
    debugLog(`\n--- Agent ${config.id} (${config.name}) raw response (first 1000 chars) ---`);
    debugLog(text.slice(0, 1000));
    debugLog('---\n');
  }

  // Try to parse JSON from the response
  try {
    // Find JSON in the text (might be wrapped in markdown code blocks)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
      text.match(/```\s*([\s\S]*?)\s*```/);

    let jsonStr: string;
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // Try to find a JSON object directly in the text
      const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
      jsonStr = jsonObjectMatch ? jsonObjectMatch[0] : text;
    }

    const parsed = JSON.parse(jsonStr.trim());
    return validateAgentOutput(parsed, config);
  } catch (e) {
    if (verbose) {
      console.error(`Agent ${config.id} (${config.name}): JSON parse failed - ${e instanceof Error ? e.message : 'unknown'}`);
    }
    // If JSON parsing fails, try to extract structured data from text
    return extractStructuredOutput(text, config);
  }
}

function validateAgentOutput(
  parsed: unknown,
  config: AgentConfig
): AgentOutput {
  // Basic validation and type coercion
  const obj = parsed as Record<string, unknown>;

  return {
    agentId: config.id,
    agentName: config.name,
    analyses: Array.isArray(obj.analyses)
      ? obj.analyses.map((a: Record<string, unknown>) => ({
          modelName: String(a.modelName || "Unknown"),
          assessment: String(a.assessment || ""),
          signal: validateSignal(a.signal),
          grade: validateGrade(a.grade),
          gradeNote: String(a.gradeNote || ""),
          keyFactors: Array.isArray(a.keyFactors)
            ? a.keyFactors.map(String)
            : [],
          quantitativeFindings: Array.isArray(a.quantitativeFindings)
            ? a.quantitativeFindings
            : undefined,
          sourcesUsed: Array.isArray(a.sourcesUsed)
            ? a.sourcesUsed.map(String)
            : undefined,
        }))
      : config.models.map((model) => ({
          modelName: model,
          assessment: "Analysis could not be completed",
          signal: "insufficient_data" as Signal,
          grade: "C" as Grade,
          gradeNote: "Unable to assess",
          keyFactors: [],
        })),
    confidence: typeof obj.confidence === "number" ? obj.confidence : 0.5,
    dataGaps: Array.isArray(obj.dataGaps) ? obj.dataGaps.map(String) : [],
  };
}

function validateSignal(signal: unknown): Signal {
  const validSignals: Signal[] = [
    "bullish",
    "bearish",
    "neutral",
    "insufficient_data",
  ];
  if (typeof signal === "string" && validSignals.includes(signal as Signal)) {
    return signal as Signal;
  }
  return "insufficient_data";
}

function validateGrade(grade: unknown): Grade {
  const validGrades: Grade[] = [
    "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"
  ];
  if (typeof grade === "string" && validGrades.includes(grade as Grade)) {
    return grade as Grade;
  }
  return "C";
}

function extractStructuredOutput(text: string, config: AgentConfig): AgentOutput {
  // Attempt to extract structured information from unstructured text
  const analyses: ModelAnalysis[] = config.models.map((model) => {
    // Try to find mentions of this model in the text
    const modelRegex = new RegExp(
      `${model.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[:\\s]*(.*?)(?=(?:${config.models
        .map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|")})|$)`,
      "is"
    );
    const match = text.match(modelRegex);
    const assessment = match ? match[1].trim().slice(0, 500) : text.slice(0, 200);

    // Try to detect signal from text
    let signal: Signal = "neutral";
    const lowerText = text.toLowerCase();
    if (
      lowerText.includes("bullish") ||
      lowerText.includes("strong buy") ||
      lowerText.includes("positive")
    ) {
      signal = "bullish";
    } else if (
      lowerText.includes("bearish") ||
      lowerText.includes("sell") ||
      lowerText.includes("negative") ||
      lowerText.includes("avoid")
    ) {
      signal = "bearish";
    } else if (
      lowerText.includes("insufficient") ||
      lowerText.includes("unclear") ||
      lowerText.includes("too hard")
    ) {
      signal = "insufficient_data";
    }

    // Derive grade from signal
    const grade: Grade = signal === "bullish" ? "B+" : signal === "bearish" ? "C-" : "C";

    return {
      modelName: model,
      assessment: assessment || "Analysis could not be extracted",
      signal,
      grade,
      gradeNote: "Derived from unstructured response",
      keyFactors: [],
    };
  });

  return {
    agentId: config.id,
    agentName: config.name,
    analyses,
    confidence: 0.3,
    dataGaps: ["Response format was not structured JSON"],
  };
}

function createFallbackOutput(config: AgentConfig): AgentOutput {
  return {
    agentId: config.id,
    agentName: config.name,
    analyses: config.models.map((model) => ({
      modelName: model,
      assessment: "Analysis could not be completed due to an error",
      signal: "insufficient_data" as Signal,
      grade: "C" as Grade,
      gradeNote: "Unable to assess",
      keyFactors: [],
    })),
    confidence: 0,
    dataGaps: ["Agent failed to complete analysis"],
  };
}

export interface AgentProgress {
  agentId: number;
  agentName: string;
  status: "pending" | "running" | "completed" | "error";
  turn: number;
  maxTurns: number;
  lastAction?: string;
  inputTokens: number;
  outputTokens: number;
}

export interface AnalysisProgress {
  completed: number;
  total: number;
  agents: AgentProgress[];
}

export async function runAllAgents(
  ticker: string,
  data: FinvizData,
  mungerConfig: LatticeConfig,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<AgentOutput[]> {
  const client = new Anthropic({ apiKey: mungerConfig.anthropicApiKey });
  const total = allAgentConfigs.length;
  let completed = 0;

  // Initialize agent progress tracking
  const agentProgressMap = new Map<number, AgentProgress>();
  for (const config of allAgentConfigs) {
    agentProgressMap.set(config.id, {
      agentId: config.id,
      agentName: config.name,
      status: "pending",
      turn: 0,
      maxTurns: MAX_TURNS,
      inputTokens: 0,
      outputTokens: 0,
    });
  }

  // Track progress
  const updateProgress = () => {
    onProgress?.({
      completed,
      total,
      agents: Array.from(agentProgressMap.values()),
    });
  };

  updateProgress();

  // Run all agents in parallel
  const results = await Promise.all(
    allAgentConfigs.map(async (config) => {
      // Mark as running
      agentProgressMap.set(config.id, {
        ...agentProgressMap.get(config.id)!,
        status: "running",
        turn: 0,
        lastAction: "Starting...",
      });
      updateProgress();

      try {
        const result = await runSingleAgent(
          client,
          config,
          ticker,
          data,
          mungerConfig,
          (turn, action, inputTokens, outputTokens) => {
            agentProgressMap.set(config.id, {
              ...agentProgressMap.get(config.id)!,
              turn,
              lastAction: action,
              inputTokens: inputTokens || 0,
              outputTokens: outputTokens || 0,
            });
            updateProgress();
          }
        );

        // Mark as completed
        agentProgressMap.set(config.id, {
          ...agentProgressMap.get(config.id)!,
          status: "completed",
          lastAction: "Done",
          inputTokens: result.totalInputTokens,
          outputTokens: result.totalOutputTokens,
        });
        completed++;
        updateProgress();

        return result.output;
      } catch (error) {
        if (VERBOSE) {
          console.error(`Agent ${config.id} (${config.name}) failed:`, error);
        }

        // Mark as error
        agentProgressMap.set(config.id, {
          ...agentProgressMap.get(config.id)!,
          status: "error",
          lastAction: error instanceof Error ? error.message.slice(0, 20) : "Failed",
        });
        completed++;
        updateProgress();

        return createFallbackOutput(config);
      }
    })
  );

  return results;
}

export function aggregateSignals(outputs: AgentOutput[]): {
  bullish: number;
  bearish: number;
  neutral: number;
  insufficientData: number;
} {
  const counts = {
    bullish: 0,
    bearish: 0,
    neutral: 0,
    insufficientData: 0,
  };

  for (const output of outputs) {
    for (const analysis of output.analyses) {
      switch (analysis.signal) {
        case "bullish":
          counts.bullish++;
          break;
        case "bearish":
          counts.bearish++;
          break;
        case "neutral":
          counts.neutral++;
          break;
        case "insufficient_data":
          counts.insufficientData++;
          break;
      }
    }
  }

  return counts;
}

export function getAverageConfidence(outputs: AgentOutput[]): number {
  if (outputs.length === 0) return 0;
  const sum = outputs.reduce((acc, o) => acc + o.confidence, 0);
  return sum / outputs.length;
}

export function collectDataGaps(outputs: AgentOutput[]): string[] {
  const gaps = new Set<string>();
  for (const output of outputs) {
    for (const gap of output.dataGaps) {
      gaps.add(gap);
    }
  }
  return Array.from(gaps);
}
