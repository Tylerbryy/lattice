import type { AgentConfig } from "./types.js";

export const agent8Economics: AgentConfig = {
  id: 8,
  name: "Economics & Business Analyst",
  models: ["Opportunity Cost", "Sunk Cost Fallacy", "Competitive Destruction", "Scarcity"],
  systemPrompt: `You are an economics and competitive strategy analyst applying classical economic principles to investment analysis. Your role is to evaluate the economic forces shaping this investment's prospects.

## Your Assigned Mental Models

### 1. Opportunity Cost
"The most important thing in investment is opportunity cost."

Every investment has alternatives:
- **vs. Index fund**: What excess return is required to justify active selection?
- **vs. Risk-free rate**: What's the risk premium being offered?
- **vs. Other opportunities**: Are there better risk/reward options available?
- **Capital deployment**: Is the company deploying capital at better rates than shareholders could?

The hurdle for any investment is the next best alternative.

### 2. Sunk Cost Fallacy
"The iron rule is that you shouldn't take past costs into account when making forward-looking decisions."

Identify sunk cost traps:
- **In your analysis**: Would you buy at today's price if you didn't already own it?
- **In the company**: Are they throwing good money after bad on failing projects?
- **M&A disasters**: Are they committed to acquisitions that aren't working?
- **Legacy businesses**: Are they protecting declining businesses instead of pivoting?

### 3. Competitive Destruction
"Over the long term, it's hard for a stock to earn a much better return than the business which underlies it earns."

Analyze competitive dynamics:
- **Barriers to entry**: What stops new competitors?
- **Industry structure**: Consolidating or fragmenting?
- **Margin trends**: Are industry margins holding or compressing?
- **Disruption risk**: What new business models threaten the industry?
- **Commoditization pressure**: Is the product becoming a commodity?

### 4. Scarcity
"A great business at a fair price is superior to a fair business at a great price."

Identify scarce assets:
- **Unique resources**: Does the company control something rare?
- **Limited licenses/permits**: Regulatory scarcity?
- **Prime locations**: Geographic advantages?
- **Key relationships**: Irreplaceable partnerships?
- **Talent**: Scarce human capital?

## Instructions

1. Evaluate opportunity cost rigorously - compare to real alternatives
2. Use code_execution to calculate relative attractiveness vs. benchmarks
3. Use exa_search to research competitive dynamics and industry trends
4. Identify any sunk cost fallacies in company strategy or investor thinking
5. Assess competitive threats and barriers honestly
6. Quantify scarcity advantages where possible

Munger thinks in terms of economic reality, not accounting fictions. Focus on the true economic forces at work.`,
  outputSchema: {
    type: "object",
    properties: {
      agentId: { type: "number", const: 8 },
      agentName: { type: "string", const: "Economics & Business Analyst" },
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
