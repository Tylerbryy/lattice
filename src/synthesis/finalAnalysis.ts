import Anthropic from "@anthropic-ai/sdk";
import type {
  AgentOutput,
  FinalAnalysis,
  Verdict,
  CategoryInsights,
  FinvizData,
} from "../data/types.js";
import {
  aggregateSignals,
  getAverageConfidence,
  collectDataGaps,
} from "../agents/orchestrator.js";
import type { LatticeConfig } from "../utils/config.js";

const MODEL = "claude-sonnet-4-5-20250929";
const MAX_TOKENS = 4096;

function buildSynthesisPrompt(
  ticker: string,
  data: FinvizData,
  agentOutputs: AgentOutput[]
): string {
  const signals = aggregateSignals(agentOutputs);
  const avgConfidence = getAverageConfidence(agentOutputs);
  const dataGaps = collectDataGaps(agentOutputs);

  // Group analyses by category
  const coreInvestment = agentOutputs
    .filter((o) => o.agentId === 1)
    .flatMap((o) => o.analyses);
  const moatsOwner = agentOutputs
    .filter((o) => o.agentId === 2)
    .flatMap((o) => o.analyses);
  const psychology = agentOutputs
    .filter((o) => o.agentId === 3 || o.agentId === 4)
    .flatMap((o) => o.analyses);
  const lollapalooza = agentOutputs
    .filter((o) => o.agentId === 5)
    .flatMap((o) => o.analyses);
  const mathProb = agentOutputs
    .filter((o) => o.agentId === 6 || o.agentId === 7)
    .flatMap((o) => o.analyses);
  const economics = agentOutputs
    .filter((o) => o.agentId === 8)
    .flatMap((o) => o.analyses);
  const systems = agentOutputs
    .filter((o) => o.agentId === 9)
    .flatMap((o) => o.analyses);
  const decisionFilters = agentOutputs
    .filter((o) => o.agentId === 10)
    .flatMap((o) => o.analyses);

  const formatAnalyses = (analyses: typeof coreInvestment) =>
    analyses
      .map(
        (a) =>
          `### ${a.modelName}\n**Signal**: ${a.signal}\n${a.assessment}\n**Key Factors**: ${a.keyFactors.join(", ")}`
      )
      .join("\n\n");

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

## Signal Tally from 10 Analysts (28 Mental Models)
- **Bullish**: ${signals.bullish} signals
- **Bearish**: ${signals.bearish} signals
- **Neutral**: ${signals.neutral} signals
- **Insufficient Data**: ${signals.insufficientData} signals
- **Average Confidence**: ${(avgConfidence * 100).toFixed(0)}%

## Data Gaps Identified
${dataGaps.length > 0 ? dataGaps.map((g) => `- ${g}`).join("\n") : "None - analysts had sufficient data"}

---

## Detailed Analysis by Category

### CORE INVESTMENT PRINCIPLES
*Circle of Competence, Margin of Safety, Mr. Market, Intrinsic Value*
${formatAnalyses(coreInvestment)}

### MOATS & OWNERSHIP
*Economic Moats, Owner-Operator Mindset*
${formatAnalyses(moatsOwner)}

### PSYCHOLOGY & BEHAVIORAL
*Misjudgment Psychology, Social Proof, Incentives, Commitment Bias, etc.*
${formatAnalyses(psychology)}

### LOLLAPALOOZA EFFECTS
*Compounding Forces, Second-Order Thinking*
${formatAnalyses(lollapalooza)}

### MATH & PROBABILITY
*Expected Value, Bayesian Thinking, Regression to Mean*
${formatAnalyses(mathProb)}

### ECONOMICS & BUSINESS
*Microeconomics, Scale, Opportunity Cost*
${formatAnalyses(economics)}

### SYSTEMS THINKING
*Feedback Loops, Adaptation, Critical Mass*
${formatAnalyses(systems)}

### DECISION FILTERS
*Too Hard Pile, Investment Checklist*
${formatAnalyses(decisionFilters)}

---

## Your Task

Synthesize this into a Charlie Munger verdict. Focus on:

1. **What's the core insight?** Don't average - find the truth. Is this a good business at a good price?

2. **What would Charlie actually say?** Be direct. Be specific. If it's overvalued, say by how much. If the moat is eroding, say why.

3. **What's the verdict?** Use the criteria:
   - STRONG BUY: Rare. Exceptional + cheap + high conviction
   - BUY: Good business, attractive price, margin of safety
   - HOLD: Fair business, fair price, no edge
   - SELL: Problems or better opportunities elsewhere
   - STRONG SELL: Rare. Major problems + overvalued
   - TOO HARD: Walk away. Outside competence.

4. **What are the red flags?** Be specific. Not "valuation concern" but "P/E of 33x for 10% growth implies paying $3.30 for $1 of earnings"

5. **What would change the verdict?** What price? What improvement? Be actionable.`;
}

function validateVerdict(verdict: unknown): Verdict {
  const validVerdicts: Verdict[] = [
    "STRONG BUY",
    "BUY",
    "HOLD",
    "SELL",
    "STRONG SELL",
    "TOO HARD",
  ];
  if (
    typeof verdict === "string" &&
    validVerdicts.includes(verdict as Verdict)
  ) {
    return verdict as Verdict;
  }
  return "HOLD";
}

function validateCategoryInsights(
  insights: unknown
): CategoryInsights {
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

export async function synthesizeAnalysis(
  ticker: string,
  data: FinvizData,
  agentOutputs: AgentOutput[],
  config: LatticeConfig
): Promise<FinalAnalysis> {
  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  const systemPrompt = `You are Charlie Munger synthesizing 10 analysts' work into a final verdict. Write as Charlie would speak: direct, witty, occasionally grumpy, always honest.

## Your Voice
- Use plain language. No jargon, no hedging.
- Be specific. "The P/E of 33x with 10% growth is paying $3.30 for $1 of earnings" not "valuation is rich."
- Include your signature wit: "This reminds me of..." or "As I've said many times..."
- Don't be afraid to be blunt: "This is a lousy business" or "The market has gone mad."

## Your Quotes (weave in 1-2 naturally)
- "Show me the incentive and I will show you the outcome"
- "Invert, always invert"
- "A great business at a fair price is superior to a fair business at a great price"
- "The first rule is not to lose. The second rule is not to forget the first rule"
- "All intelligent investing is value investing"
- "It's not given to human beings to have such talent that they can just know everything"

## Verdict Criteria
| Verdict | When to Use |
|---------|-------------|
| STRONG BUY | Exceptional business + significant undervaluation + strong conviction. Rare. |
| BUY | Good business at fair-to-attractive price with margin of safety |
| HOLD | Quality business but fully valued; or already own and no reason to sell |
| SELL | Overvalued or fundamentally deteriorating; better opportunities exist |
| STRONG SELL | Major problems + significant overvaluation. Rare. |
| TOO HARD | Cannot form a view; outside competence; too many unknowables |

## What to Synthesize
1. **The Core Insight**: What does the preponderance of evidence say? Don't average opinions - find the truth.
2. **Key Numbers**: If any analyst ran a DCF or valuation, highlight it. If not, note the absence.
3. **Category Themes**: Distill each category into one sentence capturing the essential insight.
4. **Red Flags**: What worries you most? Be specific.
5. **What Would Change Your Mind**: What would make this a better investment?

Write 2-3 paragraphs as Charlie would actually say them - as if speaking at the Berkshire annual meeting.`;

  const response = await client.beta.messages.create({
    model: MODEL,
    betas: ["structured-outputs-2025-11-13"],
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: buildSynthesisPrompt(ticker, data, agentOutputs),
      },
    ],
    output_format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          whatCharlieWouldSay: { type: "string" },
          verdict: {
            type: "string",
            enum: ["STRONG BUY", "BUY", "HOLD", "SELL", "STRONG SELL", "TOO HARD"]
          },
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
          categoryInsights: {
            type: "object",
            properties: {
              coreInvestment: { type: "string" },
              psychologyBehavioral: { type: "string" },
              mathProbability: { type: "string" },
              economicsBusiness: { type: "string" },
              systemsThinking: { type: "string" },
              decisionFilters: { type: "string" }
            },
            required: ["coreInvestment", "psychologyBehavioral", "mathProbability", "economicsBusiness", "systemsThinking", "decisionFilters"],
            additionalProperties: false
          },
          redFlags: { type: "array", items: { type: "string" } },
          whatWouldMakeThisBetter: { type: "array", items: { type: "string" } }
        },
        required: ["whatCharlieWouldSay", "verdict", "categoryInsights", "redFlags", "whatWouldMakeThisBetter"],
        additionalProperties: false
      }
    }
  } as unknown as Anthropic.Beta.Messages.MessageCreateParamsNonStreaming) as Anthropic.Beta.Messages.BetaMessage;

  const textContent = response.content.find(
    (block): block is Anthropic.Messages.TextBlock => block.type === "text"
  );

  if (!textContent) {
    return createFallbackAnalysis(agentOutputs);
  }

  try {
    // Parse JSON from response
    const jsonMatch =
      textContent.text.match(/```json\s*([\s\S]*?)\s*```/) ||
      textContent.text.match(/```\s*([\s\S]*?)\s*```/) ||
      [null, textContent.text];

    const jsonStr = jsonMatch[1] || textContent.text;
    const parsed = JSON.parse(jsonStr.trim()) as Record<string, unknown>;

    return {
      whatCharlieWouldSay: String(
        parsed.whatCharlieWouldSay || "Analysis could not be synthesized"
      ),
      verdict: validateVerdict(parsed.verdict),
      keyNumbers: parsed.keyNumbers as FinalAnalysis["keyNumbers"],
      categoryInsights: validateCategoryInsights(parsed.categoryInsights),
      redFlags: Array.isArray(parsed.redFlags)
        ? parsed.redFlags.map(String)
        : [],
      whatWouldMakeThisBetter: Array.isArray(parsed.whatWouldMakeThisBetter)
        ? parsed.whatWouldMakeThisBetter.map(String)
        : [],
    };
  } catch {
    // Try to extract what we can from unstructured text
    return extractFromText(textContent.text, agentOutputs);
  }
}

function extractFromText(
  text: string,
  agentOutputs: AgentOutput[]
): FinalAnalysis {
  // Try to detect verdict from text
  let verdict: Verdict = "HOLD";
  const upperText = text.toUpperCase();
  if (upperText.includes("STRONG BUY")) verdict = "STRONG BUY";
  else if (upperText.includes("STRONG SELL")) verdict = "STRONG SELL";
  else if (upperText.includes("TOO HARD")) verdict = "TOO HARD";
  else if (upperText.includes("BUY")) verdict = "BUY";
  else if (upperText.includes("SELL")) verdict = "SELL";

  return {
    whatCharlieWouldSay: text.slice(0, 1500),
    verdict,
    categoryInsights: {
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

function createFallbackAnalysis(agentOutputs: AgentOutput[]): FinalAnalysis {
  const signals = aggregateSignals(agentOutputs);

  let verdict: Verdict = "HOLD";
  if (signals.insufficientData > signals.bullish + signals.bearish) {
    verdict = "TOO HARD";
  } else if (signals.bullish > signals.bearish * 2) {
    verdict = signals.bullish > 15 ? "STRONG BUY" : "BUY";
  } else if (signals.bearish > signals.bullish * 2) {
    verdict = signals.bearish > 15 ? "STRONG SELL" : "SELL";
  }

  return {
    whatCharlieWouldSay:
      "The synthesis could not be completed properly. Review the individual agent analyses for insights.",
    verdict,
    categoryInsights: {
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
