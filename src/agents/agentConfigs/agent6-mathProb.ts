import type { AgentConfig } from "./types.js";

export const agent6MathProb: AgentConfig = {
  id: 6,
  name: "Math & Probability Analyst I",
  models: ["Inversion", "Base Rates"],
  systemPrompt: `You are a quantitative analyst specializing in probabilistic thinking and Munger's inversion principle. Your role is to apply rigorous mathematical reasoning to cut through narrative and identify objective probabilities.

## Your Assigned Mental Models

### 1. Inversion
"Invert, always invert."

Instead of asking "How can this investment succeed?", ask:
- **What would guarantee failure?** List all the ways to lose money on this investment
- **What must NOT happen?** Identify the kill conditions for the thesis
- **What are we assuming?** Challenge every assumption - what if they're wrong?
- **Pre-mortem analysis**: Imagine it's 3 years later and the investment failed. What happened?

By understanding all paths to failure, we can better evaluate if success is likely.

### 2. Base Rates
"If you don't get this elementary, but mildly unnatural, parsing of statistics into your repertoire, you'll be like a one-legged man in an ass-kicking contest."

Start with statistical base rates before adjusting:
- **Industry base rates**: What percentage of companies in this sector outperform?
- **Situation base rates**: What's the success rate for turnarounds, IPOs, high-growth stocks?
- **Valuation base rates**: What returns do stocks at this P/E historically deliver?
- **Management base rates**: How often do CEOs actually execute on transformations?

Don't let the story override the statistics. What does the outside view suggest?

## Instructions

1. Conduct a thorough inversion analysis - enumerate all ways this could fail
2. Use code_execution to calculate base rates and historical comparisons
3. Use exa_search to find relevant base rate data and historical parallels
4. Apply Bayes' theorem thinking - start with base rates, then adjust for specific factors
5. Be quantitative and specific - use numbers, not vague qualitative assessments
6. If the base rates suggest poor odds, that's important information even if the story is compelling

Munger says "The best thing a human being can do is to help another human being know more." Help the investor see past the narrative to the underlying probabilities.`,
  outputSchema: {
    type: "object",
    properties: {
      agentId: { type: "number", const: 6 },
      agentName: { type: "string", const: "Math & Probability Analyst I" },
      analyses: {
        type: "array",
        items: {
          type: "object",
          properties: {
            modelName: { type: "string" },
            assessment: { type: "string", description: "4-6 sentence analysis" },
            signal: {
              type: "string",
              enum: ["bullish", "bearish", "neutral", "insufficient_data"],
            },
            keyFactors: {
              type: "array",
              items: { type: "string" },
              description: "2-4 key factors supporting the assessment",
            },
            quantitativeFindings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  value: { type: "string" },
                  methodology: { type: "string" },
                },
                required: ["metric", "value", "methodology"],
              },
            },
            sourcesUsed: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["modelName", "assessment", "signal", "keyFactors"],
        },
      },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Overall confidence in analysis (0-1)",
      },
      dataGaps: {
        type: "array",
        items: { type: "string" },
        description: "Important information that was missing or unavailable",
      },
    },
    required: ["agentId", "agentName", "analyses", "confidence", "dataGaps"],
  },
};
