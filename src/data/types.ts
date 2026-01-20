export interface FinvizData {
  ticker: string;
  companyName: string;
  sector: string;
  industry: string;
  country: string;
  marketCap: string;
  price: string;
  change: string;
  volume: string;

  // Valuation metrics
  pe: string;
  forwardPE: string;
  peg: string;
  ps: string;
  pb: string;
  pCash: string;
  pFree: string;

  // Financial metrics
  epsThisY: string;
  epsNextY: string;
  epsNext5Y: string;
  epsPast5Y: string;
  salesPast5Y: string;
  salesQQ: string;
  epsQQ: string;

  // Margins & returns
  grossMargin: string;
  operMargin: string;
  profitMargin: string;
  roe: string;
  roi: string;
  roa: string;

  // Balance sheet
  currentRatio: string;
  quickRatio: string;
  ltDebtEq: string;
  debtEq: string;

  // Dividend
  dividend: string;
  dividendYield: string;
  payoutRatio: string;

  // Analyst data
  targetPrice: string;
  recom: string;

  // Performance
  perf52W: string;
  perfYTD: string;
  perfMonth: string;
  perfQuarter: string;

  // Volatility
  beta: string;
  volatility: string;

  // Other
  shortFloat: string;
  shortRatio: string;
  insiderOwn: string;
  instOwn: string;
  sma20: string;
  sma50: string;
  sma200: string;
  rsi14: string;

  // Company description
  description: string;

  // Recent news
  news: NewsItem[];
}

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  date: string;
}

export type Signal = "bullish" | "bearish" | "neutral" | "insufficient_data";

export interface QuantitativeFinding {
  metric: string;
  value: string;
  methodology: string;
}

export interface ModelAnalysis {
  modelName: string;
  assessment: string;
  signal: Signal;
  keyFactors: string[];
  quantitativeFindings?: QuantitativeFinding[];
  sourcesUsed?: string[];
}

export interface AgentOutput {
  agentId: number;
  agentName: string;
  analyses: ModelAnalysis[];
  confidence: number;
  dataGaps: string[];
}

export type Verdict =
  | "STRONG BUY"
  | "BUY"
  | "HOLD"
  | "SELL"
  | "STRONG SELL"
  | "TOO HARD";

export interface KeyNumbers {
  intrinsicValueEstimate?: {
    value: number;
    methodology: string;
  };
  marginOfSafety?: number;
  fiveYearCAGRProjection?: number;
}

export interface CategoryInsights {
  coreInvestment: string;
  psychologyBehavioral: string;
  mathProbability: string;
  economicsBusiness: string;
  systemsThinking: string;
  decisionFilters: string;
}

export interface FinalAnalysis {
  whatCharlieWouldSay: string;
  verdict: Verdict;
  keyNumbers?: KeyNumbers;
  categoryInsights: CategoryInsights;
  redFlags: string[];
  whatWouldMakeThisBetter: string[];
}

export interface AnalysisResult {
  ticker: string;
  financialData: FinvizData;
  agentOutputs: AgentOutput[];
  finalAnalysis: FinalAnalysis;
}
