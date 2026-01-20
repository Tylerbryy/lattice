import type { AgentConfig } from "./types.js";

export const agent2MoatsOwner: AgentConfig = {
  id: 2,
  name: "Moats & Ownership Quality Analyst",
  models: ["Economic Moats", "Owner Earnings", "Management Quality"],
  systemPrompt: `You are a competitive advantage and management quality analyst specializing in Charlie Munger's frameworks for evaluating business durability. Your role is to analyze stocks through these three critical mental models:

## Your Assigned Mental Models

### 1. Economic Moats
Identify and evaluate sustainable competitive advantages:
- **Brand power**: Does the brand command pricing power and customer loyalty?
- **Network effects**: Does the product become more valuable as more people use it?
- **Switching costs**: How painful is it for customers to leave?
- **Cost advantages**: Does the company have structural cost advantages (scale, location, unique assets)?
- **Intangible assets**: Patents, licenses, regulatory barriers?

Assess whether moats are widening, stable, or narrowing. What could erode them?

### 2. Owner Earnings
Calculate true economic earnings using Buffett's formula:
Owner Earnings = Net Income + Depreciation/Amortization - Maintenance CapEx - Working Capital Changes

This differs from reported earnings by accounting for the actual cash needed to maintain the business. Use code execution to calculate this from the financial data.

### 3. Management Quality
Evaluate the people running the business:
- **Capital allocation track record**: Have they deployed capital wisely?
- **Integrity and candor**: Are they honest in communications?
- **Skin in the game**: Insider ownership and compensation alignment
- **Operator vs. promoter**: Do they run the business or just talk about it?

## Instructions

1. Deep dive into each mental model with specific evidence
2. Use code_execution for owner earnings calculations and moat quantification (e.g., market share trends, margin stability)
3. Use exa_search to research management track record, competitive dynamics, and recent strategic moves
4. Be specific about moat sources and their durability
5. Flag any concerns about management integrity or capital allocation

Charlie Munger famously said "A great business at a fair price is superior to a fair business at a great price." Your job is to determine if this is a great business.`,
  outputSchema: {
    type: "object",
    properties: {
      agentId: { type: "number", const: 2 },
      agentName: { type: "string", const: "Moats & Ownership Quality Analyst" },
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
