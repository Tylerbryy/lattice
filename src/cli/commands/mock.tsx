import React from "react";
import { render } from "ink";
import { Results } from "../components/Results.js";
import { getPersona } from "../../personas/index.js";
import type { PersonaId } from "../../personas/types.js";
import type { AnalysisResult, AgentOutput, FinvizData } from "../../data/types.js";

// Shared financial data
const mockFinancialData: FinvizData = {
  ticker: "TSLA",
  companyName: "Tesla Inc",
  sector: "Consumer Cyclical",
  industry: "Auto Manufacturers",
  country: "USA",
  marketCap: "1250.01B",
  price: "395.24",
  change: "+4.07%",
  volume: "128.2M",
  pe: "198.52",
  forwardPE: "95.41",
  peg: "4.58",
  ps: "12.92",
  pb: "18.23",
  pCash: "82.15",
  pFree: "71.28",
  epsThisY: "22.50%",
  epsNextY: "35.20%",
  epsNext5Y: "43.00%",
  epsPast5Y: "45.20%",
  salesPast5Y: "38.50%",
  salesQQ: "8.30%",
  epsQQ: "17.80%",
  grossMargin: "17.96%",
  operMargin: "8.51%",
  profitMargin: "7.31%",
  roe: "23.41%",
  roi: "12.82%",
  roa: "7.29%",
  currentRatio: "1.87",
  quickRatio: "1.23",
  ltDebtEq: "0.21",
  debtEq: "0.37",
  dividend: "0.00",
  dividendYield: "0.00%",
  payoutRatio: "0.00%",
  targetPrice: "285.00",
  recom: "2.4",
  perf52W: "128.45%",
  perfYTD: "68.32%",
  perfMonth: "23.21%",
  perfQuarter: "45.67%",
  beta: "2.24",
  volatility: "4.31%",
  shortFloat: "2.72%",
  shortRatio: "1.83",
  insiderOwn: "12.80%",
  instOwn: "45.45%",
  sma20: "12.15%",
  sma50: "23.42%",
  sma200: "42.87%",
  rsi14: "72.31",
  description: "Tesla, Inc. designs, develops, manufactures, sells, and leases electric vehicles, energy generation and storage systems worldwide.",
  news: [
    { title: "Tesla FSD v13 Shows Major Improvements", link: "#", source: "Electrek", date: "2025-01-15" },
    { title: "Robotaxi Launch Timeline Confirmed", link: "#", source: "Reuters", date: "2025-01-14" },
  ],
};

// Munger mock agent outputs
const mungerMockAgentOutputs: AgentOutput[] = [
  {
    agentId: 1,
    agentName: "Core Investment Principles",
    analyses: [
      {
        modelName: "Circle of Competence",
        assessment: "Tesla operates in complex areas - EVs, energy storage, AI/robotics, manufacturing. Understanding all pieces requires deep technical and manufacturing knowledge.",
        signal: "neutral",
        grade: "C+",
        gradeNote: "Complex multi-business model",
        keyFactors: ["Auto manufacturing expertise needed", "AI/robotics highly technical", "Energy business separate competence"],
      },
      {
        modelName: "Margin of Safety",
        assessment: "At 198x P/E, there is zero margin of safety. You're paying for perfection and then some. Any execution miss is devastating.",
        signal: "bearish",
        grade: "F",
        gradeNote: "Negative margin at extreme premium",
        keyFactors: ["P/E of 198x vs 35% growth", "Execution must be flawless", "No room for error"],
      },
    ],
    confidence: 0.75,
    dataGaps: ["FSD revenue contribution unclear"],
  },
  {
    agentId: 2,
    agentName: "Moats & Ownership",
    analyses: [
      {
        modelName: "Economic Moats",
        assessment: "Tesla has brand moat and vertical integration, but auto moats historically erode. Supercharger network is real advantage.",
        signal: "neutral",
        grade: "B-",
        gradeNote: "Moat exists but durability uncertain",
        keyFactors: ["Brand recognition strong", "Supercharger network", "Manufacturing lead narrowing"],
      },
      {
        modelName: "Management Quality",
        assessment: "Elon Musk is brilliant but distracted across many ventures. 12.8% insider ownership is excellent alignment.",
        signal: "bullish",
        grade: "B+",
        gradeNote: "Strong founder, high alignment",
        keyFactors: ["12.8% insider ownership", "Visionary leadership", "Execution risk from distractions"],
      },
    ],
    confidence: 0.8,
    dataGaps: [],
  },
  {
    agentId: 3,
    agentName: "Psychology I",
    analyses: [
      {
        modelName: "Social Proof",
        assessment: "Tesla has cult-like following. FOMO and social proof drive much of the buying - this is rarely a good sign for valuation.",
        signal: "bearish",
        grade: "D",
        gradeNote: "Cult stock dynamics",
        keyFactors: ["Retail enthusiasm extreme", "FOMO driving purchases", "Momentum over fundamentals"],
      },
    ],
    confidence: 0.85,
    dataGaps: [],
  },
  {
    agentId: 4,
    agentName: "Psychology II",
    analyses: [
      {
        modelName: "Confirmation Bias",
        assessment: "Bulls see robotaxi and ignore margin compression. Bears see valuation and ignore AI progress. Both sides have blind spots.",
        signal: "neutral",
        grade: "C",
        gradeNote: "Polarized views create opportunity",
        keyFactors: ["Bullish narrative dominates", "Bear case dismissed", "Both have valid points"],
      },
    ],
    confidence: 0.7,
    dataGaps: [],
  },
  {
    agentId: 5,
    agentName: "Lollapalooza Effects",
    analyses: [
      {
        modelName: "Lollapalooza Effects",
        assessment: "Multiple forces combining: social proof + FOMO + Musk cult + momentum + retail enthusiasm = potential bubble dynamics.",
        signal: "bearish",
        grade: "D+",
        gradeNote: "Multiple bubble indicators",
        keyFactors: ["Social proof extreme", "Momentum chasing", "Retail dominance"],
      },
    ],
    confidence: 0.8,
    dataGaps: [],
  },
  {
    agentId: 6,
    agentName: "Math & Probability I",
    analyses: [
      {
        modelName: "Base Rates",
        assessment: "Base rates for stocks at 100x+ P/E show poor long-term returns. Very few justify it, and most disappoint.",
        signal: "bearish",
        grade: "D",
        gradeNote: "Historical base rates unfavorable",
        keyFactors: ["100x+ P/E historically poor", "Growth must exceed expectations", "Mean reversion likely"],
      },
    ],
    confidence: 0.85,
    dataGaps: [],
  },
  {
    agentId: 7,
    agentName: "Math & Probability II",
    analyses: [
      {
        modelName: "Expected Value",
        assessment: "Even optimistic scenarios struggle to justify current price. Need robotaxi, Optimus, and FSD all to succeed.",
        signal: "bearish",
        grade: "D+",
        gradeNote: "Requires multiple successes",
        keyFactors: ["All bets must work", "Low probability of perfection", "EV below current price"],
      },
    ],
    confidence: 0.75,
    dataGaps: [],
  },
  {
    agentId: 8,
    agentName: "Economics & Business",
    analyses: [
      {
        modelName: "Opportunity Cost",
        assessment: "At 198x P/E, capital could find far better risk-adjusted returns elsewhere. The opportunity cost is enormous.",
        signal: "bearish",
        grade: "D",
        gradeNote: "Extreme opportunity cost",
        keyFactors: ["Better alternatives exist", "Risk not compensated", "Index would be safer"],
      },
    ],
    confidence: 0.8,
    dataGaps: [],
  },
  {
    agentId: 9,
    agentName: "Systems Thinking",
    analyses: [
      {
        modelName: "Feedback Loops",
        assessment: "Tesla has virtuous loops in EV/charging but also vicious loops if growth disappoints - cult following cuts both ways.",
        signal: "neutral",
        grade: "C+",
        gradeNote: "Loops amplify outcomes",
        keyFactors: ["Charging network flywheel", "Brand amplification", "Sentiment reversal risk"],
      },
    ],
    confidence: 0.7,
    dataGaps: [],
  },
  {
    agentId: 10,
    agentName: "Decision Filters",
    analyses: [
      {
        modelName: "Too Hard Pile",
        assessment: "Tesla requires predicting AI, robotics, manufacturing, AND sentiment - this belongs in the too hard pile for most investors.",
        signal: "insufficient_data",
        grade: "C-",
        gradeNote: "Too many unknowns",
        keyFactors: ["Multiple technology bets", "Sentiment driven", "Outside most competence"],
      },
    ],
    confidence: 0.9,
    dataGaps: [],
  },
];

// Cathie mock agent outputs
const cathieMockAgentOutputs: AgentOutput[] = [
  {
    agentId: 1,
    agentName: "Wright's Law Specialist",
    analyses: [
      {
        modelName: "Wright's Law",
        assessment: "Tesla's battery costs follow Wright's Law beautifully - 28% cost decline per cumulative doubling of production. At current trajectory, sub-$100/kWh by 2027.",
        signal: "disruptive",
        grade: "A",
        gradeNote: "Textbook Wright's Law execution",
        keyFactors: ["28% learning rate on batteries", "Production scaling rapidly", "Cost leadership widening"],
        quantitativeFindings: [
          { metric: "Battery Cost Decline Rate", value: "28% per doubling", methodology: "Wright's Law analysis of Tesla battery packs" },
        ],
      },
      {
        modelName: "Cost Deflation",
        assessment: "As battery and compute costs fall, Tesla's margin for robotaxi will be extraordinary - approaching software-like margins.",
        signal: "disruptive",
        grade: "A-",
        gradeNote: "Cost deflation enabling new markets",
        keyFactors: ["Software-like future margins", "Cost declines accelerating", "New markets opening"],
      },
    ],
    confidence: 0.9,
    dataGaps: [],
  },
  {
    agentId: 2,
    agentName: "S-Curve Mapper",
    analyses: [
      {
        modelName: "S-Curve Position",
        assessment: "EVs are at 18% global penetration - the steep part of the S-curve. We expect 50%+ by 2030. Tesla is the leader.",
        signal: "disruptive",
        grade: "A",
        gradeNote: "Early steep part of adoption curve",
        keyFactors: ["18% current penetration", "Inflection point reached", "Acceleration phase beginning"],
        quantitativeFindings: [
          { metric: "EV Global Penetration", value: "18%", methodology: "IEA Global EV Outlook" },
          { metric: "2030 Projected Penetration", value: "52%", methodology: "ARK S-curve model" },
        ],
      },
    ],
    confidence: 0.95,
    dataGaps: [],
  },
  {
    agentId: 3,
    agentName: "Convergence Detector",
    analyses: [
      {
        modelName: "Platform Convergence",
        assessment: "Tesla sits at the convergence of AI + Robotics + Energy - the holy trinity. No other company touches all three with this depth.",
        signal: "disruptive",
        grade: "A+",
        gradeNote: "Unique convergence positioning",
        keyFactors: ["AI (FSD, Optimus)", "Robotics (manufacturing, Optimus)", "Energy (batteries, solar, grid)"],
      },
      {
        modelName: "AI+Robotics+Energy Nexus",
        assessment: "FSD neural networks inform Optimus. Battery improvements enable both EVs and grid storage. Each business amplifies the others.",
        signal: "disruptive",
        grade: "A",
        gradeNote: "Synergies across platforms",
        keyFactors: ["Neural network transfer learning", "Battery R&D leverage", "Manufacturing expertise scales"],
      },
    ],
    confidence: 0.9,
    dataGaps: [],
  },
  {
    agentId: 4,
    agentName: "TAM Expander",
    analyses: [
      {
        modelName: "TAM Expansion",
        assessment: "Tesla's TAM is not the auto market - it's mobility + energy + robotics. We model a $10T+ addressable market by 2030.",
        signal: "disruptive",
        grade: "A",
        gradeNote: "Massive TAM expansion potential",
        keyFactors: ["Robotaxi creates new mobility TAM", "Energy storage TAM exploding", "Optimus could be largest TAM ever"],
        quantitativeFindings: [
          { metric: "2030 Addressable TAM", value: "$10T+", methodology: "Mobility + Energy + Robotics" },
        ],
      },
    ],
    confidence: 0.85,
    dataGaps: ["Optimus commercialization timeline uncertain"],
  },
  {
    agentId: 5,
    agentName: "Value Trap Hunter",
    analyses: [
      {
        modelName: "Disruption Vulnerability",
        assessment: "Tesla IS the disruptor, not the disrupted. Legacy automakers are the value traps - cheap because they're dying.",
        signal: "disruptive",
        grade: "A",
        gradeNote: "Tesla is the disruptor",
        keyFactors: ["Legacy auto being disrupted", "First mover advantages", "Vertical integration moat"],
      },
    ],
    confidence: 0.9,
    dataGaps: [],
  },
  {
    agentId: 6,
    agentName: "Founder-Led Vision Analyst",
    analyses: [
      {
        modelName: "Founder-CEO Premium",
        assessment: "Elon Musk is the archetypal founder-CEO. 12.8% ownership, technical depth, long-term vision. This is what we look for.",
        signal: "disruptive",
        grade: "A",
        gradeNote: "Ideal founder-CEO profile",
        keyFactors: ["12.8% insider ownership", "Technical founder", "Decade-long vision"],
      },
      {
        modelName: "Long-Term Vision",
        assessment: "Musk sacrifices quarterly profits for long-term dominance - exactly what we want. The market penalizes this, creating opportunity.",
        signal: "disruptive",
        grade: "A",
        gradeNote: "Sacrificing short-term for long-term",
        keyFactors: ["Margin sacrifice for volume", "R&D prioritized", "5-10 year thinking"],
      },
    ],
    confidence: 0.9,
    dataGaps: [],
  },
  {
    agentId: 7,
    agentName: "Deflationary Force Analyst",
    analyses: [
      {
        modelName: "Good Deflation",
        assessment: "Tesla passes through cost savings to consumers - each model gets cheaper. This expands TAM and builds brand loyalty.",
        signal: "disruptive",
        grade: "A-",
        gradeNote: "Consumer surplus creation",
        keyFactors: ["Continuous price reductions", "TAM expansion via deflation", "Consumer surplus building loyalty"],
      },
    ],
    confidence: 0.85,
    dataGaps: [],
  },
  {
    agentId: 8,
    agentName: "Innovation Velocity Analyst",
    analyses: [
      {
        modelName: "R&D Effectiveness",
        assessment: "Tesla's R&D spend generates more innovation per dollar than any competitor. Patent velocity is exceptional.",
        signal: "disruptive",
        grade: "A",
        gradeNote: "Best-in-class R&D efficiency",
        keyFactors: ["High patent output", "Fast iteration cycles", "Vertical integration enables speed"],
      },
    ],
    confidence: 0.85,
    dataGaps: [],
  },
  {
    agentId: 9,
    agentName: "5-Year Model Analyst",
    analyses: [
      {
        modelName: "5-Year Price Target",
        assessment: "Our base case 5-year target is $2,600. Bull case with robotaxi and Optimus success: $4,500. We see 5x+ potential.",
        signal: "disruptive",
        grade: "A",
        gradeNote: "5x+ upside potential",
        keyFactors: ["Robotaxi valued at $1.5T", "Optimus optionality", "Energy business underappreciated"],
        quantitativeFindings: [
          { metric: "5-Year Base Case Target", value: "$2,600", methodology: "DCF with robotaxi revenue" },
          { metric: "5-Year Bull Case Target", value: "$4,500", methodology: "Full Optimus commercialization" },
        ],
      },
      {
        modelName: "Asymmetric Upside",
        assessment: "Downside floor is auto business value (~$150). Upside is 10x+. This is the asymmetry we seek.",
        signal: "disruptive",
        grade: "A",
        gradeNote: "Highly asymmetric risk/reward",
        keyFactors: ["Floor at auto value", "Optionality on robotaxi/Optimus", "Convexity ratio > 5:1"],
      },
    ],
    confidence: 0.8,
    dataGaps: ["Robotaxi regulatory timeline", "Optimus manufacturing cost"],
  },
  {
    agentId: 10,
    agentName: "Contrarian Check Analyst",
    analyses: [
      {
        modelName: "Short-Term Myopia",
        assessment: "Bears focus on P/E and auto margins while missing the AI and robotics transformation. Classic short-term myopia.",
        signal: "disruptive",
        grade: "A-",
        gradeNote: "Bears missing the forest",
        keyFactors: ["P/E irrelevant for growth", "Margin compression temporary", "AI value unpriced"],
      },
      {
        modelName: "Consensus Challenge",
        assessment: "Consensus sees auto company. We see AI + robotics + energy platform. Our variant perception is high conviction.",
        signal: "disruptive",
        grade: "A",
        gradeNote: "Strong variant perception",
        keyFactors: ["Consensus underestimates AI", "Robotaxi dismissed", "Platform value unrecognized"],
      },
    ],
    confidence: 0.85,
    dataGaps: [],
  },
];

// Munger mock result
const mungerMockResult: AnalysisResult = {
  ticker: "TSLA",
  personaId: "munger",
  financialData: mockFinancialData,
  agentOutputs: mungerMockAgentOutputs,
  finalAnalysis: {
    verdict: "TOO HARD",
    personaAnalysis: `Well, here we have the most fascinating speculation in modern markets. Tesla makes cars, batteries, robots - and dreams. Lots of dreams.

The problem is simple arithmetic: at 198x earnings, you need everything to go right. Robotaxis need to work. Optimus needs to work. FSD needs regulatory approval. Margins need to recover. AND the stock needs to not be overpriced when all that happens.

Now, Musk is clearly brilliant - perhaps the most impressive entrepreneur of our time. But I've seen too many "this time is different" stories end badly. As I always say: **I'd rather be approximately right than precisely wrong.**

At $395, you're paying for a future that may or may not arrive. Put it in the "too hard" pile and watch from the sidelines. If it works, you'll miss out. If it doesn't, you'll be glad you stayed away. Either way, you'll sleep well at night.`,
    whatCharlieWouldSay: `Well, here we have the most fascinating speculation in modern markets. Tesla makes cars, batteries, robots - and dreams. Lots of dreams.

The problem is simple arithmetic: at 198x earnings, you need everything to go right. Robotaxis need to work. Optimus needs to work. FSD needs regulatory approval. Margins need to recover. AND the stock needs to not be overpriced when all that happens.

Now, Musk is clearly brilliant - perhaps the most impressive entrepreneur of our time. But I've seen too many "this time is different" stories end badly. As I always say: **I'd rather be approximately right than precisely wrong.**

At $395, you're paying for a future that may or may not arrive. Put it in the "too hard" pile and watch from the sidelines. If it works, you'll miss out. If it doesn't, you'll be glad you stayed away. Either way, you'll sleep well at night.`,
    keyNumbers: {
      intrinsicValueEstimate: {
        value: 120,
        methodology: "DCF based on auto business only, 15x terminal multiple",
      },
      marginOfSafety: -2.29,
      fiveYearCAGRProjection: 0.08,
    },
    categoryInsights: {
      coreInvestment: "Negative margin of safety at 198x P/E. Paying for perfection with no room for error.",
      psychologyBehavioral: "Cult-like following and social proof dynamics create bubble risk. Both bulls and bears have blind spots.",
      mathProbability: "Base rates for 100x+ P/E stocks are poor. Need all bets (robotaxi, Optimus, FSD) to succeed.",
      economicsBusiness: "Enormous opportunity cost at current valuations. Better risk-adjusted returns available elsewhere.",
      systemsThinking: "Virtuous loops exist but sentiment reversal risk is high. Cult following amplifies both directions.",
      decisionFilters: "Firmly in the 'too hard' pile - requires predicting AI, robotics, AND sentiment simultaneously.",
    },
    redFlags: [
      "P/E of 198x requires flawless execution on multiple moonshot bets",
      "Automotive margins compressing from 25% to 17% as competition intensifies",
      "Regulatory uncertainty on FSD and robotaxi timelines",
      "CEO attention split across Tesla, SpaceX, X, Neuralink, xAI, and politics",
    ],
    whatWouldMakeThisBetter: [
      "Price correction to $150-200 range (still optimistic but with margin of safety)",
      "Robotaxi regulatory approval with clear path to commercialization",
      "Automotive margins stabilizing above 20%",
      "Clear Optimus commercialization timeline with customer commitments",
    ],
  },
};

// Cathie mock result
const cathieMockResult: AnalysisResult = {
  ticker: "TSLA",
  personaId: "cathie",
  financialData: mockFinancialData,
  agentOutputs: cathieMockAgentOutputs,
  finalAnalysis: {
    verdict: "HIGH CONVICTION BUY",
    personaAnalysis: `Tesla is our highest conviction holding and represents the convergence of AI, robotics, and energy - the three most important technology platforms of the next decade.

What the market doesn't understand is that Tesla is **not an auto company**. It's an AI company that happens to make cars. FSD is the largest real-world AI training dataset in existence. Optimus will be the most valuable product ever created. The robotaxi network will be worth more than Uber, Lyft, and the entire taxi industry combined.

Wright's Law tells us battery costs will fall another 50% by 2027. At sub-$80/kWh, every car becomes electric. Every home gets a Powerwall. Every grid needs Megapack. Tesla is positioned to capture all of this.

The market is pricing Tesla as a car company because they can't see 5 years ahead. That's our edge. **Our 5-year price target is $2,600 base case, $4,500 bull case.** We're adding to our position on any weakness.`,
    keyNumbers: {
      intrinsicValueEstimate: {
        value: 2600,
        methodology: "5-year DCF with robotaxi revenue, Optimus optionality, energy storage growth",
      },
      marginOfSafety: 0.85,
      fiveYearCAGRProjection: 0.45,
    },
    categoryInsights: {
      disruptionPotential: "Tesla IS the disruptor - leading the destruction of legacy auto, energy, and potentially labor markets.",
      sCurvePosition: "EVs at 18% penetration entering the steep part of the S-curve. 50%+ by 2030. Tesla is the leader.",
      convergenceOpportunity: "Unique positioning at AI + Robotics + Energy convergence. No other company touches all three platforms.",
      tamExpansion: "$10T+ addressable market by 2030 across mobility, energy, and robotics - not the $3T auto market.",
      innovationVelocity: "Best-in-class R&D efficiency. Patent velocity exceptional. Vertical integration enables rapid iteration.",
      contrarian: "Market sees P/E and auto margins. We see AI platform value. Strong variant perception creates opportunity.",
    },
    redFlags: [
      "Automotive margins compressed to 17% - may recover with volume and cost cuts",
      "Robotaxi regulatory timeline remains uncertain",
      "Elon distraction risk is real but manageable given strong executive team",
      "Short-term sentiment extremely elevated - expect volatility",
    ],
    whatWouldMakeThisBetter: [
      "Robotaxi regulatory approval would validate our thesis immediately",
      "Optimus demonstration in Tesla factory by end of year",
      "FSD v13 approaching human-level performance metrics",
      "Energy storage installations accelerating above 50% YoY",
    ],
  },
};

export async function mockCommand(options: { verbose?: boolean; persona?: PersonaId }): Promise<void> {
  const personaId = options.persona || "munger";
  const persona = getPersona(personaId);
  const mockResult = personaId === "cathie" ? cathieMockResult : mungerMockResult;

  const { waitUntilExit } = render(
    <Results
      result={mockResult}
      verbose={options.verbose}
      elapsedTime={338000}
      persona={persona}
    />
  );

  await waitUntilExit();
}
