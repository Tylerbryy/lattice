import React from "react";
import { render } from "ink";
import { Results } from "../components/Results.js";
import type { AnalysisResult, AgentOutput } from "../../data/types.js";

const mockAgentOutputs: AgentOutput[] = [
  {
    agentId: 1,
    agentName: "Core Investment Principles",
    analyses: [
      {
        modelName: "Circle of Competence",
        assessment: "Apple operates firmly within most investors' circle of competence - consumer electronics and services are intuitive businesses. However, the AI and autonomous vehicle initiatives push into less familiar territory.",
        signal: "bullish",
        keyFactors: ["Consumer electronics expertise", "Services growth clear", "AI strategy uncertain"],
      },
      {
        modelName: "Margin of Safety",
        assessment: "At current valuations, there is negative margin of safety. P/E of 33.5x for a company growing earnings at 10% implies significant optimism already priced in.",
        signal: "bearish",
        keyFactors: ["P/E of 33.5x vs 10% growth", "PEG ratio of 2.6x", "No margin of safety at current price"],
        quantitativeFindings: [
          { metric: "Intrinsic Value", value: "$149", methodology: "DCF with 10% discount rate, 8% terminal growth" },
          { metric: "Margin of Safety", value: "-68%", methodology: "Current price vs intrinsic value" },
        ],
      },
      {
        modelName: "Mr. Market",
        assessment: "Mr. Market is currently euphoric about Apple, pricing in AI-driven growth that hasn't materialized. The stock trades near all-time highs despite decelerating revenue.",
        signal: "bearish",
        keyFactors: ["Near all-time highs", "AI euphoria premium", "Revenue decelerating"],
      },
      {
        modelName: "Intrinsic Value",
        assessment: "Using a conservative DCF model with 10% discount rate and assuming 8% long-term growth, intrinsic value is approximately $149 per share.",
        signal: "bearish",
        keyFactors: ["DCF suggests $149 fair value", "Current price 68% premium", "Growth assumptions aggressive"],
      },
    ],
    confidence: 0.85,
    dataGaps: ["Limited visibility into Apple Intelligence adoption rates"],
  },
  {
    agentId: 2,
    agentName: "Moats & Ownership",
    analyses: [
      {
        modelName: "Economic Moats",
        assessment: "Apple possesses one of the widest moats in technology through its ecosystem switching costs, brand loyalty, and network effects in the App Store.",
        signal: "bullish",
        keyFactors: ["Ecosystem lock-in", "1.2B active devices", "App Store network effects"],
      },
      {
        modelName: "Owner Earnings",
        assessment: "Apple generates exceptional owner earnings with $100B+ in annual free cash flow, though growth is slowing. Buybacks return capital efficiently.",
        signal: "bullish",
        keyFactors: ["$100B+ annual FCF", "Aggressive buybacks", "Minimal capex requirements"],
      },
      {
        modelName: "Management Quality",
        assessment: "Tim Cook has executed well operationally but innovation has slowed. Insider ownership at 0.1% is concerning for alignment.",
        signal: "neutral",
        keyFactors: ["Strong operations", "Innovation concerns", "Low insider ownership (0.1%)"],
      },
    ],
    confidence: 0.9,
    dataGaps: [],
  },
  {
    agentId: 3,
    agentName: "Psychology I",
    analyses: [
      {
        modelName: "Incentive-Caused Bias",
        assessment: "Wall Street analysts have strong incentives to maintain Buy ratings on Apple given its weight in indices and trading volumes.",
        signal: "bearish",
        keyFactors: ["Analyst conflicts", "Index inclusion pressure", "Trading revenue incentives"],
      },
      {
        modelName: "Social Proof",
        assessment: "Apple ownership has become a social proof trade - everyone owns it, creating herd behavior that may not reflect fundamentals.",
        signal: "bearish",
        keyFactors: ["Most widely held stock", "Herd mentality", "Momentum chasing"],
      },
      {
        modelName: "Availability Bias",
        assessment: "Apple's ubiquitous presence in daily life creates availability bias - we overweight familiar brands when making investment decisions.",
        signal: "neutral",
        keyFactors: ["Brand familiarity", "Consumer exposure bias", "Media coverage"],
      },
    ],
    confidence: 0.75,
    dataGaps: ["Retail vs institutional sentiment data"],
  },
  {
    agentId: 4,
    agentName: "Psychology II",
    analyses: [
      {
        modelName: "Confirmation Bias",
        assessment: "Bulls may be ignoring the China revenue collapse (-17% YoY) while focusing only on Services growth narrative.",
        signal: "bearish",
        keyFactors: ["China decline ignored", "Services narrative overweighted", "iPhone saturation dismissed"],
      },
      {
        modelName: "Commitment & Consistency",
        assessment: "Long-term holders may be anchored to past success, maintaining positions despite changed fundamentals.",
        signal: "neutral",
        keyFactors: ["Historical success anchor", "Position inertia", "Identity-based holding"],
      },
      {
        modelName: "Loss Aversion",
        assessment: "Given Apple's status as a 'safe' stock, investors may be loss averse to selling even when valuations are stretched.",
        signal: "neutral",
        keyFactors: ["Safe stock perception", "Reluctance to sell winners", "Tax implications"],
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
        assessment: "Multiple psychological biases are combining to potentially create a **bearish lollapalooza**: social proof + confirmation bias + availability bias all pointing toward overvaluation.",
        signal: "bearish",
        keyFactors: ["Multiple biases aligned", "Overvaluation signals", "Sentiment extreme"],
      },
      {
        modelName: "Second-Order Thinking",
        assessment: "First-order: Apple is a great company. Second-order: But great company ≠ great investment at any price. Third-order: When will sentiment shift?",
        signal: "bearish",
        keyFactors: ["Price vs quality disconnect", "Sentiment reversal risk", "Mean reversion potential"],
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
        modelName: "Inversion",
        assessment: "Inverting the question: What would make Apple a bad investment? Answer: Paying 33x earnings for 10% growth in a company facing China headwinds and peak iPhone.",
        signal: "bearish",
        keyFactors: ["High multiple for low growth", "Geographic risk", "Product maturity"],
      },
      {
        modelName: "Base Rates",
        assessment: "Base rates for companies trading at 33x P/E with 10% growth show poor forward returns historically. PEG > 2 rarely works out.",
        signal: "bearish",
        keyFactors: ["Historical PEG performance", "High P/E base rates", "Growth deceleration patterns"],
        quantitativeFindings: [
          { metric: "PEG > 2 Forward Returns", value: "-3.2% annually", methodology: "20-year backtest of S&P 500 stocks" },
        ],
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
        assessment: "Bull case ($300): 30% probability. Base case ($200): 40% probability. Bear case ($120): 30% probability. Expected value: $203, below current price.",
        signal: "bearish",
        keyFactors: ["Probability-weighted downside", "Asymmetric risk/reward", "Limited upside vs downside"],
        quantitativeFindings: [
          { metric: "Expected Value", value: "$203", methodology: "Probability-weighted scenarios" },
          { metric: "Expected Return", value: "-19%", methodology: "EV vs current price of $250" },
        ],
      },
      {
        modelName: "Compound Interest",
        assessment: "At current valuations, 5-year CAGR projection is ~3.5%, barely exceeding risk-free rate. Poor compounding setup.",
        signal: "bearish",
        keyFactors: ["Low projected CAGR", "Opportunity cost", "Better alternatives exist"],
        quantitativeFindings: [
          { metric: "5-Year CAGR Projection", value: "3.5%", methodology: "Gordon growth model with multiple compression" },
        ],
      },
    ],
    confidence: 0.8,
    dataGaps: [],
  },
  {
    agentId: 8,
    agentName: "Economics & Business",
    analyses: [
      {
        modelName: "Opportunity Cost",
        assessment: "Capital deployed in Apple at 33x P/E could earn higher risk-adjusted returns elsewhere. The opportunity cost is significant.",
        signal: "bearish",
        keyFactors: ["Better alternatives available", "Risk-adjusted return comparison", "Capital allocation"],
      },
      {
        modelName: "Sunk Cost Fallacy",
        assessment: "Investors may be holding Apple due to past gains rather than future prospects - a classic sunk cost trap.",
        signal: "neutral",
        keyFactors: ["Past gains irrelevant", "Forward-looking analysis needed", "Position sizing review"],
      },
      {
        modelName: "Competitive Destruction",
        assessment: "Apple faces potential disruption from AI-first devices and Chinese competitors. The moat, while wide, isn't impenetrable.",
        signal: "neutral",
        keyFactors: ["AI disruption risk", "Chinese competition", "Innovation pace"],
      },
      {
        modelName: "Scarcity",
        assessment: "There is no scarcity in Apple shares - it's the most liquid stock globally. No scarcity premium warranted.",
        signal: "neutral",
        keyFactors: ["High liquidity", "No scarcity premium", "Easy entry/exit"],
      },
    ],
    confidence: 0.75,
    dataGaps: [],
  },
  {
    agentId: 9,
    agentName: "Systems Thinking",
    analyses: [
      {
        modelName: "Feedback Loops",
        assessment: "Apple's ecosystem creates powerful **positive feedback loops**: more users → more developers → better apps → more users. This flywheel remains intact but is decelerating.",
        signal: "bullish",
        keyFactors: ["Ecosystem flywheel", "Developer lock-in", "User stickiness"],
      },
      {
        modelName: "Critical Mass",
        assessment: "Apple has achieved critical mass with 1.2B active devices. The installed base provides recurring revenue stability.",
        signal: "bullish",
        keyFactors: ["1.2B device installed base", "Network effects", "Platform dominance"],
      },
      {
        modelName: "Scale Economics",
        assessment: "Apple benefits from massive scale economics in supply chain and R&D amortization. However, incremental benefits are diminishing.",
        signal: "neutral",
        keyFactors: ["Supply chain advantages", "R&D leverage", "Diminishing marginal returns"],
      },
    ],
    confidence: 0.85,
    dataGaps: [],
  },
  {
    agentId: 10,
    agentName: "Decision Filters",
    analyses: [
      {
        modelName: "Too Hard Pile",
        assessment: "Apple is NOT too hard to understand - the business model is clear. However, predicting AI monetization and China trajectory is genuinely difficult.",
        signal: "neutral",
        keyFactors: ["Clear business model", "AI uncertainty", "China unpredictable"],
      },
      {
        modelName: "Checklist",
        assessment: "Quality checklist: PASS (9/10). Valuation checklist: FAIL (2/10). Overall: Great business at the wrong price.",
        signal: "bearish",
        keyFactors: ["Quality criteria met", "Valuation criteria failed", "Price discipline required"],
      },
    ],
    confidence: 0.9,
    dataGaps: [],
  },
];

const mockResult: AnalysisResult = {
  ticker: "AAPL",
  financialData: {
    ticker: "AAPL",
    companyName: "Apple Inc",
    sector: "Technology",
    industry: "Consumer Electronics",
    country: "USA",
    marketCap: "3678.01B",
    price: "250.24",
    change: "-2.07%",
    volume: "48.2M",
    pe: "33.52",
    forwardPE: "28.41",
    peg: "2.58",
    ps: "8.92",
    pb: "51.23",
    pCash: "42.15",
    pFree: "31.28",
    epsThisY: "12.50%",
    epsNextY: "10.20%",
    epsNext5Y: "13.00%",
    epsPast5Y: "15.20%",
    salesPast5Y: "8.50%",
    salesQQ: "-4.30%",
    epsQQ: "7.80%",
    grossMargin: "45.96%",
    operMargin: "31.51%",
    profitMargin: "26.31%",
    roe: "157.41%",
    roi: "56.82%",
    roa: "25.29%",
    currentRatio: "0.87",
    quickRatio: "0.83",
    ltDebtEq: "1.51",
    debtEq: "1.87",
    dividend: "1.00",
    dividendYield: "0.40%",
    payoutRatio: "15.00%",
    targetPrice: "245.00",
    recom: "1.8",
    perf52W: "28.45%",
    perfYTD: "18.32%",
    perfMonth: "-3.21%",
    perfQuarter: "5.67%",
    beta: "1.24",
    volatility: "2.31%",
    shortFloat: "0.72%",
    shortRatio: "1.23",
    insiderOwn: "0.10%",
    instOwn: "61.45%",
    sma20: "-2.15%",
    sma50: "3.42%",
    sma200: "12.87%",
    rsi14: "42.31",
    description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
    news: [
      { title: "Apple's AI Strategy Faces Scrutiny", link: "#", source: "WSJ", date: "2025-01-15" },
      { title: "iPhone Sales in China Drop 17%", link: "#", source: "Reuters", date: "2025-01-14" },
    ],
  },
  agentOutputs: mockAgentOutputs,
  finalAnalysis: {
    verdict: "TOO HARD",
    whatCharlieWouldSay: `Well, here we have one of the **finest businesses ever created** - Apple makes more money than God and has built switching costs that would make John D. Rockefeller envious.

The problem is simple: you're being asked to pay $250 for something worth maybe $149, and that's *if* China doesn't blow up in their face and the AI story actually works out. I've never liked paying a premium for hope.

Now, I'm not saying sell it if you own it - the tax bill alone would make me weep. But buying here? That's what I call "drinking the Kool-Aid."

As I always say: **It's far better to buy a wonderful company at a fair price than a fair company at a wonderful price.** Apple is wonderful, but this price is far from fair. Put it in the "too hard" pile and wait for Mr. Market to have a bad day.`,
    keyNumbers: {
      intrinsicValueEstimate: {
        value: 149,
        methodology: "DCF with 10% discount rate, 8% terminal growth, 15x terminal multiple",
      },
      marginOfSafety: -0.68,
      fiveYearCAGRProjection: 0.035,
    },
    categoryInsights: {
      coreInvestment: "Exceptional business, but paying $250 for $149 of value violates margin of safety principles.",
      psychologyBehavioral: "Multiple biases (social proof, confirmation, availability) creating dangerous groupthink around Apple.",
      mathProbability: "Expected value of $203 with 3.5% projected CAGR barely exceeds risk-free rate - poor risk/reward.",
      economicsBusiness: "Winner-take-most dynamics intact in US, but China collapse (-17% revenue) threatens the growth narrative.",
      systemsThinking: "Ecosystem flywheel remains powerful but is measurably decelerating as installed base matures.",
      decisionFilters: "Passes all quality checks with flying colors, but fails every valuation metric. Classic 'great company, wrong price.'",
    },
    redFlags: [
      "P/E of 33.5x for 10% growth = PEG of 2.6x, implying 68% overvaluation by historical standards",
      "China revenue collapsed 17% YoY, with market position falling from #1 to #3",
      "Insider ownership at just 0.1% while authorizing $110B in buybacks - misaligned incentives",
      "Services growth (the bull case) is decelerating: 14% → 11% → 9% over last 3 quarters",
    ],
    whatWouldMakeThisBetter: [
      "Price correction to $150-175 range would provide adequate margin of safety",
      "Clear evidence of Apple Intelligence driving incremental iPhone upgrades",
      "Stabilization or recovery in China market share",
      "Acceleration in Services growth to offset hardware maturation",
    ],
  },
};

export async function mockCommand(options: { verbose?: boolean }): Promise<void> {
  const { waitUntilExit } = render(
    <Results
      result={mockResult}
      verbose={options.verbose}
      elapsedTime={338000}
    />
  );

  await waitUntilExit();
}
