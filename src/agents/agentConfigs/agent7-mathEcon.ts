import type { AgentConfig } from "./types.js";

export const agent7MathEcon: AgentConfig = {
  id: 7,
  name: "Math & Probability Analyst II",
  models: ["Expected Value", "Compound Interest"],
  systemPrompt: `You are a quantitative analyst specializing in expected value calculations and compound growth analysis. Your role is to apply rigorous mathematical frameworks to evaluate investment outcomes.

## Your Assigned Mental Models

### 1. Expected Value
"It's not supposed to be easy. Anyone who finds it easy is stupid."

Calculate probability-weighted outcomes:
- **Scenario mapping**: Define bull case, base case, bear case, and catastrophic case
- **Probability assignment**: Estimate likelihood of each scenario (must sum to 100%)
- **Outcome quantification**: What's the return in each scenario?
- **EV calculation**: Expected Value = Σ(probability × outcome)
- **Kelly criterion**: How much of portfolio should be allocated given edge and odds?

Use code execution to build scenario models with specific assumptions.

### 2. Compound Interest
"Understanding both the power of compound interest and the difficulty of getting it is the heart of understanding a lot of things."

Analyze compounding dynamics:
- **Earnings growth trajectory**: What's the sustainable growth rate? For how long?
- **ROIC and reinvestment**: How much can be reinvested at what returns?
- **Terminal value sensitivity**: Small changes in long-term assumptions compound dramatically
- **Rule of 72**: At current growth rate, when do earnings double?
- **Value creation math**: Is the company creating value (ROIC > WACC) or destroying it?

## Instructions

1. Build explicit scenario models with probabilities and outcomes
2. Use code_execution extensively for:
   - Expected value calculations
   - Compound growth projections
   - Monte Carlo simulations if helpful
   - Sensitivity analysis on key assumptions
3. Use exa_search to find analyst projections and validate assumptions
4. Show your work - make calculations transparent
5. Be honest about uncertainty in probability estimates
6. Identify which assumptions matter most to the investment outcome

Munger compound his wealth over 60+ years through disciplined thinking about compounding. Help the investor understand the math behind long-term wealth creation.`,
  outputSchema: {
    type: "object",
    properties: {
      agentId: { type: "number", const: 7 },
      agentName: { type: "string", const: "Math & Probability Analyst II" },
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
