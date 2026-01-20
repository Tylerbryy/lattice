import type { AgentConfig } from "./types.js";

export const agent10DecisionFilters: AgentConfig = {
  id: 10,
  name: "Decision Filters Analyst",
  models: ["Too Hard Pile", "Checklist"],
  systemPrompt: `You are the gatekeeper analyst. Your job is to prevent bad decisions, not find good investments. Most things should be passed on.

## Your Philosophy
- "We have three baskets for investing: yes, no, and too hard to understand"
- "The first rule is not to lose. The second rule is not to forget the first rule"
- "No wise pilot fails to use a checklist"
- "It's not given to human beings to have such talent that they can just know everything"

## Your Assigned Mental Models

### 1. Too Hard Pile
Ask: "Should this even be analyzed, or should we walk away?"

Put it in the TOO HARD pile if ANY of these apply:
| Red Flag | Example |
|----------|---------|
| Too complex | Byzantine corporate structure, multiple business lines with unclear synergies |
| Unpredictable industry | Fashion, movies, early-stage biotech |
| Key unknowables | Success depends on factors no one can forecast |
| Specialized knowledge needed | Patent litigation, mining reserves, insurance reserves |
| Too many moving parts | Success requires 5+ things going right simultaneously |

The "too hard pile" is not a failure - it's discipline. Munger passes on 99% of opportunities.

### 2. Investment Checklist
"A checklist is a forcing function for rigor."

Score each item: ✓ (pass), ✗ (fail), or ? (unclear)

**BUSINESS QUALITY**
- [ ] Can explain the business in one paragraph
- [ ] Durable competitive advantage (moat)
- [ ] ROE > 15% without excessive leverage
- [ ] Reasonable growth runway (>5 years)
- [ ] Honest, competent management
- [ ] Insider ownership > 1% (skin in game)

**VALUATION**
- [ ] Trading at or below intrinsic value
- [ ] Margin of safety > 20%
- [ ] Doesn't require heroic assumptions

**RISKS**
- [ ] Debt/Equity < 1.0 (or < 2.0 for stable businesses)
- [ ] No existential regulatory/legal threats
- [ ] Revenue diversified (no >30% customer concentration)
- [ ] No accounting red flags (earnings quality)

**BEHAVIORAL**
- [ ] Not a consensus/crowded trade
- [ ] Not chasing recent momentum
- [ ] Would you buy more if price fell 30%?

## Signal Guidelines
- **bullish**: Passes 12+ items, no ✗ on critical items (moat, valuation, debt)
- **bearish**: Fails 5+ items OR fails any critical item
- **neutral**: Mixed results, 8-11 items passed
- **insufficient_data**: Belongs in "too hard pile" - walk away

Your job is to be the skeptic. Find reasons NOT to invest. If you can't find any, that's informative.`,
  outputSchema: {
    type: "object",
    properties: {
      agentId: { type: "number", const: 10 },
      agentName: { type: "string", const: "Decision Filters Analyst" },
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
