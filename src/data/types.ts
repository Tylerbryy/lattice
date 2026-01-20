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

// Re-export persona types for convenience
export type {
  PersonaId,
  MungerSignal,
  MungerVerdict,
  CathieSignal,
  CathieVerdict,
  MungerCategoryInsights,
  CathieCategoryInsights,
} from "../personas/types.js";

// Import for local use
import type {
  PersonaId,
  Signal as PersonaSignal,
  Verdict as PersonaVerdict,
  CategoryInsights as PersonaCategoryInsights,
} from "../personas/types.js";

// Use persona union types
export type Signal = PersonaSignal;

export interface QuantitativeFinding {
  metric: string;
  value: string;
  methodology: string;
}

export type Grade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "D-" | "F";

export interface ModelAnalysis {
  modelName: string;
  assessment: string;
  signal: Signal;
  grade: Grade;
  gradeNote: string;
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

export type Verdict = PersonaVerdict;

export interface KeyNumbers {
  intrinsicValueEstimate?: {
    value: number;
    methodology: string;
  };
  marginOfSafety?: number;
  fiveYearCAGRProjection?: number;
}

export type CategoryInsights = PersonaCategoryInsights;

export interface FinalAnalysis {
  /** The persona's analysis in their voice */
  personaAnalysis: string;
  /** @deprecated Use personaAnalysis - kept for backward compatibility with Munger analyses */
  whatCharlieWouldSay?: string;
  verdict: Verdict;
  keyNumbers?: KeyNumbers;
  categoryInsights: CategoryInsights;
  redFlags: string[];
  whatWouldMakeThisBetter: string[];
}

export interface AnalysisResult {
  ticker: string;
  personaId: PersonaId;
  financialData: FinvizData;
  agentOutputs: AgentOutput[];
  finalAnalysis: FinalAnalysis;
}
