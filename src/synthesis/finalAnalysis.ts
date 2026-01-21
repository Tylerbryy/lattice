import Anthropic from "@anthropic-ai/sdk";
import type {
  AgentOutput,
  FinalAnalysis,
  Verdict,
  FinvizData,
  MungerCategoryInsights,
  CathieCategoryInsights,
} from "../data/types.js";
import {
  aggregateSignals,
  getAverageConfidence,
  collectDataGaps,
} from "../agents/orchestrator.js";
import type { LatticeConfig } from "../utils/config.js";
import type { PersonaConfig, CategoryInsights } from "../personas/types.js";
import { getPersonaSafe, DEFAULT_PERSONA_ID } from "../personas/index.js";

const MODEL = "claude-sonnet-4-5-20250929";
const MAX_TOKENS = 4096;

function buildSynthesisPrompt(
  ticker: string,
  data: FinvizData,
  agentOutputs: AgentOutput[],
  persona: PersonaConfig
): string {
  const signals = aggregateSignals(agentOutputs);
  const avgConfidence = getAverageConfidence(agentOutputs);
  const dataGaps = collectDataGaps(agentOutputs);

  const formatAnalyses = (agentIds: readonly number[]) => {
    const analyses = agentOutputs
      .filter((o) => agentIds.includes(o.agentId))
      .flatMap((o) => o.analyses);
    return analyses
      .map(
        (a) =>
          `### ${a.modelName}\n**Signal**: ${a.signal}\n${a.assessment}\n**Key Factors**: ${a.keyFactors.join(", ")}`
      )
      .join("\n\n");
  };

  // Build category sections dynamically from agent groups
  const categorySections = persona.agentGroups
    .map((group) => {
      const analysesContent = formatAnalyses(group.agentIds);
      return `### ${group.title.toUpperCase()}\n${analysesContent}`;
    })
    .join("\n\n");

  // Persona-specific signal labels
  const signalLabels = persona.id === "cathie"
    ? {
        positive: "Disruptive",
        negative: "Legacy",
        neutral: "Stagnant",
        unknown: "Insufficient Data",
      }
    : {
        positive: "Bullish",
        negative: "Bearish",
        neutral: "Neutral",
        unknown: "Insufficient Data",
      };

  // Persona-specific verdict instructions
  const verdictInstructions = persona.id === "cathie"
    ? `3. **What's the verdict?** Use the criteria:
   - HIGH CONVICTION BUY: At convergence of multiple platforms + massive TAM + 5x potential
   - CONVICTION BUY: Clear disruptive positioning + strong S-curve + 3x potential
   - HOLD: Disruptive characteristics but priced in, or needs more validation
   - EXIT LEGACY: Value trap - cheap because it's being disrupted
   - TOO EARLY: Technology pre-commercial or market not ready`
    : `3. **What's the verdict?** Use the criteria:
   - STRONG BUY: Rare. Exceptional + cheap + high conviction
   - BUY: Good business, attractive price, margin of safety
   - HOLD: Fair business, fair price, no edge
   - SELL: Problems or better opportunities elsewhere
   - STRONG SELL: Rare. Major problems + overvalued
   - TOO HARD: Walk away. Outside competence.`;

  return `# Synthesis Request: ${ticker} (${data.companyName})

## The Numbers That Matter
| Metric | Value |
|--------|-------|
| Current Price | $${data.price} |
| P/E Ratio | ${data.pe} |
| Forward P/E | ${data.forwardPE} |
| P/B | ${data.pb} |
| ROE | ${data.roe} |
| Debt/Equity | ${data.debtEq} |
| Insider Ownership | ${data.insiderOwn} |
| Institutional Ownership | ${data.instOwn} |

## Signal Tally from 10 Analysts
- **${signalLabels.positive}**: ${signals.bullish} signals
- **${signalLabels.negative}**: ${signals.bearish} signals
- **${signalLabels.neutral}**: ${signals.neutral} signals
- **${signalLabels.unknown}**: ${signals.insufficientData} signals
- **Average Confidence**: ${(avgConfidence * 100).toFixed(0)}%

## Data Gaps Identified
${dataGaps.length > 0 ? dataGaps.map((g) => `- ${g}`).join("\n") : "None - analysts had sufficient data"}

---

## Detailed Analysis by Category

${categorySections}

---

## Your Task

Synthesize this into a ${persona.displayName} verdict. Focus on:

1. **What's the core insight?** Don't average - find the truth.

2. **What would ${persona.displayName} actually say?** Be direct. Be specific.

${verdictInstructions}

4. **What are the red flags?** Be specific with numbers.

5. **What would change the verdict?** What price? What improvement? Be actionable.`;
}

function validateVerdict(verdict: unknown, persona: PersonaConfig): Verdict {
  const validVerdicts = persona.validVerdicts;
  if (
    typeof verdict === "string" &&
    validVerdicts.includes(verdict as Verdict)
  ) {
    return verdict as Verdict;
  }
  return "HOLD" as Verdict;
}

function validateMungerCategoryInsights(
  insights: unknown
): MungerCategoryInsights {
  const obj = (insights as Record<string, unknown>) || {};
  return {
    coreInvestment: String(obj.coreInvestment || "No insight provided"),
    psychologyBehavioral: String(obj.psychologyBehavioral || "No insight provided"),
    mathProbability: String(obj.mathProbability || "No insight provided"),
    economicsBusiness: String(obj.economicsBusiness || "No insight provided"),
    systemsThinking: String(obj.systemsThinking || "No insight provided"),
    decisionFilters: String(obj.decisionFilters || "No insight provided"),
  };
}

function validateCathieCategoryInsights(
  insights: unknown
): CathieCategoryInsights {
  const obj = (insights as Record<string, unknown>) || {};
  return {
    disruptionPotential: String(obj.disruptionPotential || "No insight provided"),
    sCurvePosition: String(obj.sCurvePosition || "No insight provided"),
    convergenceOpportunity: String(obj.convergenceOpportunity || "No insight provided"),
    tamExpansion: String(obj.tamExpansion || "No insight provided"),
    innovationVelocity: String(obj.innovationVelocity || "No insight provided"),
    contrarian: String(obj.contrarian || "No insight provided"),
  };
}

function validateCategoryInsights(
  insights: unknown,
  persona: PersonaConfig
): CategoryInsights {
  if (persona.id === "cathie") {
    return validateCathieCategoryInsights(insights);
  }
  return validateMungerCategoryInsights(insights);
}

export async function synthesizeAnalysis(
  ticker: string,
  data: FinvizData,
  agentOutputs: AgentOutput[],
  config: LatticeConfig,
  persona?: PersonaConfig
): Promise<FinalAnalysis> {
  const resolvedPersona = persona || getPersonaSafe(DEFAULT_PERSONA_ID);
  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  const systemPrompt = resolvedPersona.synthesis.systemPrompt;
  const verdictSchema = resolvedPersona.synthesis.verdictSchema;
  const categoryInsightsSchema = resolvedPersona.synthesis.categoryInsightsSchema;

  const response = await client.beta.messages.create({
    model: MODEL,
    betas: ["structured-outputs-2025-11-13"],
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: buildSynthesisPrompt(ticker, data, agentOutputs, resolvedPersona),
      },
    ],
    output_format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          personaAnalysis: { type: "string" },
          verdict: verdictSchema,
          keyNumbers: {
            type: "object",
            properties: {
              intrinsicValueEstimate: {
                type: "object",
                properties: {
                  value: { type: "number" },
                  methodology: { type: "string" }
                },
                required: ["value", "methodology"],
                additionalProperties: false
              },
              marginOfSafety: { type: "number" },
              fiveYearCAGRProjection: { type: "number" }
            },
            additionalProperties: false
          },
          categoryInsights: categoryInsightsSchema,
          redFlags: { type: "array", items: { type: "string" } },
          whatWouldMakeThisBetter: { type: "array", items: { type: "string" } }
        },
        required: ["personaAnalysis", "verdict", "categoryInsights", "redFlags", "whatWouldMakeThisBetter"],
        additionalProperties: false
      }
    }
  } as unknown as Anthropic.Beta.Messages.MessageCreateParamsNonStreaming) as Anthropic.Beta.Messages.BetaMessage;

  const textContent = response.content.find(
    (block): block is Anthropic.Messages.TextBlock => block.type === "text"
  );

  if (!textContent) {
    return createFallbackAnalysis(agentOutputs, resolvedPersona);
  }

  try {
    // Parse JSON from response
    const jsonMatch =
      textContent.text.match(/```json\s*([\s\S]*?)\s*```/) ||
      textContent.text.match(/```\s*([\s\S]*?)\s*```/) ||
      [null, textContent.text];

    const jsonStr = jsonMatch[1] || textContent.text;
    const parsed = JSON.parse(jsonStr.trim()) as Record<string, unknown>;

    // Handle double-encoded JSON (API sometimes returns JSON string in personaAnalysis field)
    let personaAnalysis = String(
      parsed.personaAnalysis || parsed.whatCharlieWouldSay || "Analysis could not be synthesized"
    );

    // If personaAnalysis looks like JSON, try to extract the actual text
    if (personaAnalysis.startsWith("{") && personaAnalysis.includes("personaAnalysis")) {
      try {
        const nested = JSON.parse(personaAnalysis) as Record<string, unknown>;
        personaAnalysis = String(nested.personaAnalysis || nested.whatCharlieWouldSay || personaAnalysis);
      } catch {
        // Keep original if nested parse fails
      }
    }

    return {
      personaAnalysis,
      // Backward compatibility for Munger persona
      whatCharlieWouldSay: resolvedPersona.id === "munger" ? personaAnalysis : undefined,
      verdict: validateVerdict(parsed.verdict, resolvedPersona),
      keyNumbers: parsed.keyNumbers as FinalAnalysis["keyNumbers"],
      categoryInsights: validateCategoryInsights(parsed.categoryInsights, resolvedPersona),
      redFlags: Array.isArray(parsed.redFlags)
        ? parsed.redFlags.map(String)
        : [],
      whatWouldMakeThisBetter: Array.isArray(parsed.whatWouldMakeThisBetter)
        ? parsed.whatWouldMakeThisBetter.map(String)
        : [],
    };
  } catch {
    // Try to extract what we can from unstructured text
    return extractFromText(textContent.text, agentOutputs, resolvedPersona);
  }
}

function extractFromText(
  text: string,
  agentOutputs: AgentOutput[],
  persona: PersonaConfig
): FinalAnalysis {
  // Try to detect verdict from text
  const upperText = text.toUpperCase();
  let verdict: Verdict;

  if (persona.id === "cathie") {
    if (upperText.includes("HIGH CONVICTION BUY")) verdict = "HIGH CONVICTION BUY";
    else if (upperText.includes("CONVICTION BUY")) verdict = "CONVICTION BUY";
    else if (upperText.includes("EXIT LEGACY")) verdict = "EXIT LEGACY";
    else if (upperText.includes("TOO EARLY")) verdict = "TOO EARLY";
    else verdict = "HOLD";
  } else {
    if (upperText.includes("STRONG BUY")) verdict = "STRONG BUY";
    else if (upperText.includes("STRONG SELL")) verdict = "STRONG SELL";
    else if (upperText.includes("TOO HARD")) verdict = "TOO HARD";
    else if (upperText.includes("BUY")) verdict = "BUY";
    else if (upperText.includes("SELL")) verdict = "SELL";
    else verdict = "HOLD";
  }

  const personaAnalysis = text.slice(0, 1500);

  return {
    personaAnalysis,
    whatCharlieWouldSay: persona.id === "munger" ? personaAnalysis : undefined,
    verdict,
    categoryInsights: persona.id === "cathie"
      ? {
          disruptionPotential: "See detailed analysis above",
          sCurvePosition: "See detailed analysis above",
          convergenceOpportunity: "See detailed analysis above",
          tamExpansion: "See detailed analysis above",
          innovationVelocity: "See detailed analysis above",
          contrarian: "See detailed analysis above",
        }
      : {
          coreInvestment: "See detailed analysis above",
          psychologyBehavioral: "See detailed analysis above",
          mathProbability: "See detailed analysis above",
          economicsBusiness: "See detailed analysis above",
          systemsThinking: "See detailed analysis above",
          decisionFilters: "See detailed analysis above",
        },
    redFlags: collectDataGaps(agentOutputs).slice(0, 5),
    whatWouldMakeThisBetter: [],
  };
}

function createFallbackAnalysis(
  agentOutputs: AgentOutput[],
  persona: PersonaConfig
): FinalAnalysis {
  const signals = aggregateSignals(agentOutputs);

  let verdict: Verdict;
  if (persona.id === "cathie") {
    if (signals.insufficientData > signals.bullish + signals.bearish) {
      verdict = "TOO EARLY";
    } else if (signals.bullish > signals.bearish * 2) {
      verdict = signals.bullish > 15 ? "HIGH CONVICTION BUY" : "CONVICTION BUY";
    } else if (signals.bearish > signals.bullish * 2) {
      verdict = "EXIT LEGACY";
    } else {
      verdict = "HOLD";
    }
  } else {
    if (signals.insufficientData > signals.bullish + signals.bearish) {
      verdict = "TOO HARD";
    } else if (signals.bullish > signals.bearish * 2) {
      verdict = signals.bullish > 15 ? "STRONG BUY" : "BUY";
    } else if (signals.bearish > signals.bullish * 2) {
      verdict = signals.bearish > 15 ? "STRONG SELL" : "SELL";
    } else {
      verdict = "HOLD";
    }
  }

  const personaAnalysis = "The synthesis could not be completed properly. Review the individual agent analyses for insights.";

  return {
    personaAnalysis,
    whatCharlieWouldSay: persona.id === "munger" ? personaAnalysis : undefined,
    verdict,
    categoryInsights: persona.id === "cathie"
      ? {
          disruptionPotential: "Review agent 1-2 analysis",
          sCurvePosition: "Review agent 2 analysis",
          convergenceOpportunity: "Review agent 3 analysis",
          tamExpansion: "Review agent 4 analysis",
          innovationVelocity: "Review agent 8 analysis",
          contrarian: "Review agent 10 analysis",
        }
      : {
          coreInvestment: "Review agent 1 analysis",
          psychologyBehavioral: "Review agents 3-4 analysis",
          mathProbability: "Review agents 6-7 analysis",
          economicsBusiness: "Review agent 8 analysis",
          systemsThinking: "Review agent 9 analysis",
          decisionFilters: "Review agent 10 analysis",
        },
    redFlags: collectDataGaps(agentOutputs),
    whatWouldMakeThisBetter: ["Complete synthesis analysis"],
  };
}
