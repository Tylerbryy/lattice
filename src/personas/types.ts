import type { AgentConfig } from "../agents/agentConfigs/types.js";

export type PersonaId = "munger" | "cathie";

// Munger-specific types
export type MungerSignal = "bullish" | "bearish" | "neutral" | "insufficient_data";
export type MungerVerdict = "STRONG BUY" | "BUY" | "HOLD" | "SELL" | "STRONG SELL" | "TOO HARD";

// Cathie-specific types
export type CathieSignal = "disruptive" | "stagnant" | "legacy" | "insufficient_data";
export type CathieVerdict = "HIGH CONVICTION BUY" | "CONVICTION BUY" | "HOLD" | "EXIT LEGACY" | "TOO EARLY";

// Union types for runtime flexibility
export type Signal = MungerSignal | CathieSignal;
export type Verdict = MungerVerdict | CathieVerdict;

// Category insight keys differ by persona
export interface MungerCategoryInsights {
  coreInvestment: string;
  psychologyBehavioral: string;
  mathProbability: string;
  economicsBusiness: string;
  systemsThinking: string;
  decisionFilters: string;
}

export interface CathieCategoryInsights {
  disruptionPotential: string;
  sCurvePosition: string;
  convergenceOpportunity: string;
  tamExpansion: string;
  innovationVelocity: string;
  contrarian: string;
}

export type CategoryInsights = MungerCategoryInsights | CathieCategoryInsights;

// Category display configuration
export interface CategoryConfig {
  key: string;
  label: string;
  color: string;
}

// Agent group configuration for UI
export interface AgentGroupConfig {
  title: string;
  agentIds: readonly number[];
  color: string;
}

// Synthesis prompt configuration
export interface SynthesisConfig {
  systemPrompt: string;
  verdictSchema: {
    type: string;
    enum: string[];
  };
  categoryInsightsSchema: object;
  buildPrompt: (agentGroupings: AgentGroupConfig[]) => string;
}

// Complete persona configuration
export interface PersonaConfig {
  id: PersonaId;
  name: string;
  displayName: string;
  description: string;

  // Agent configurations
  agents: AgentConfig[];

  // UI configuration
  categories: CategoryConfig[];
  agentGroups: AgentGroupConfig[];

  // Synthesis configuration
  synthesis: SynthesisConfig;

  // Verdict helpers
  validVerdicts: readonly string[];
  validSignals: readonly string[];

  // UI color/symbol helpers
  getVerdictColor: (verdict: string) => string;
  getVerdictSymbol: (verdict: string) => string;
  getSignalColor: (signal: string) => string;
  getSignalSymbol: (signal: string) => string;
}
