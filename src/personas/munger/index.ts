import type { PersonaConfig, CategoryConfig, AgentGroupConfig, MungerVerdict, MungerSignal } from "../types.js";
import { mungerAgents } from "./agents.js";
import { mungerSynthesisConfig } from "./synthesis.js";

// Category configuration for Munger persona
export const mungerCategories: CategoryConfig[] = [
  { key: "coreInvestment", label: "Core Investment", color: "cyan" },
  { key: "psychologyBehavioral", label: "Psychology", color: "magenta" },
  { key: "mathProbability", label: "Math & Probability", color: "blue" },
  { key: "economicsBusiness", label: "Economics", color: "yellow" },
  { key: "systemsThinking", label: "Systems", color: "green" },
  { key: "decisionFilters", label: "Decision Filters", color: "white" },
];

// Agent groupings for Munger persona UI
export const mungerAgentGroups: AgentGroupConfig[] = [
  { title: "Core Investment Principles", agentIds: [1], color: "cyan" },
  { title: "Moats & Ownership Quality", agentIds: [2], color: "cyan" },
  { title: "Psychology & Behavioral", agentIds: [3, 4], color: "magenta" },
  { title: "Lollapalooza Effects", agentIds: [5], color: "magenta" },
  { title: "Math & Probability", agentIds: [6, 7], color: "blue" },
  { title: "Economics & Business", agentIds: [8], color: "yellow" },
  { title: "Systems Thinking", agentIds: [9], color: "green" },
  { title: "Decision Filters", agentIds: [10], color: "white" },
];

// Valid verdicts and signals for Munger
export const mungerValidVerdicts: readonly MungerVerdict[] = [
  "STRONG BUY",
  "BUY",
  "HOLD",
  "SELL",
  "STRONG SELL",
  "TOO HARD",
] as const;

export const mungerValidSignals: readonly MungerSignal[] = [
  "bullish",
  "bearish",
  "neutral",
  "insufficient_data",
] as const;

// Verdict color helper
function getMungerVerdictColor(verdict: string): string {
  switch (verdict) {
    case "STRONG BUY":
      return "green";
    case "BUY":
      return "greenBright";
    case "HOLD":
      return "yellow";
    case "SELL":
      return "redBright";
    case "STRONG SELL":
      return "red";
    case "TOO HARD":
      return "gray";
    default:
      return "white";
  }
}

// Verdict symbol helper
function getMungerVerdictSymbol(verdict: string): string {
  switch (verdict) {
    case "STRONG BUY":
      return "++";
    case "BUY":
      return "+";
    case "HOLD":
      return "=";
    case "SELL":
      return "-";
    case "STRONG SELL":
      return "--";
    case "TOO HARD":
      return "?";
    default:
      return "";
  }
}

// Signal color helper
function getMungerSignalColor(signal: string): string {
  switch (signal) {
    case "bullish":
      return "green";
    case "bearish":
      return "red";
    case "neutral":
      return "yellow";
    case "insufficient_data":
      return "gray";
    default:
      return "white";
  }
}

// Signal symbol helper
function getMungerSignalSymbol(signal: string): string {
  switch (signal) {
    case "bullish":
      return "+";
    case "bearish":
      return "-";
    case "neutral":
      return "~";
    case "insufficient_data":
      return "?";
    default:
      return " ";
  }
}

// Complete Munger persona configuration
export const mungerPersona: PersonaConfig = {
  id: "munger",
  name: "munger",
  displayName: "Charlie Munger",
  description: "Value investing through 28 mental models - margin of safety, moats, and rigorous analysis",

  // Agent configurations
  agents: mungerAgents,

  // UI configuration
  categories: mungerCategories,
  agentGroups: mungerAgentGroups,

  // Synthesis configuration
  synthesis: mungerSynthesisConfig,

  // Verdict helpers
  validVerdicts: mungerValidVerdicts,
  validSignals: mungerValidSignals,

  // UI color/symbol helpers
  getVerdictColor: getMungerVerdictColor,
  getVerdictSymbol: getMungerVerdictSymbol,
  getSignalColor: getMungerSignalColor,
  getSignalSymbol: getMungerSignalSymbol,
};
