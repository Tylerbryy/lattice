import type { PersonaConfig, CategoryConfig, AgentGroupConfig, CathieVerdict, CathieSignal } from "../types.js";
import { cathieAgents } from "./agents.js";
import { cathieSynthesisConfig } from "./synthesis.js";

// Category configuration for Cathie persona
export const cathieCategories: CategoryConfig[] = [
  { key: "disruptionPotential", label: "Disruption Potential", color: "magenta" },
  { key: "sCurvePosition", label: "S-Curve Position", color: "cyan" },
  { key: "convergenceOpportunity", label: "Convergence", color: "blue" },
  { key: "tamExpansion", label: "TAM Expansion", color: "green" },
  { key: "innovationVelocity", label: "Innovation", color: "yellow" },
  { key: "contrarian", label: "Contrarian View", color: "white" },
];

// Agent groupings for Cathie persona UI
export const cathieAgentGroups: AgentGroupConfig[] = [
  { title: "Wright's Law & Cost Curves", agentIds: [1], color: "magenta" },
  { title: "S-Curve Dynamics", agentIds: [2], color: "cyan" },
  { title: "Platform Convergence", agentIds: [3], color: "blue" },
  { title: "TAM Expansion", agentIds: [4], color: "green" },
  { title: "Disruption Risk", agentIds: [5], color: "red" },
  { title: "Leadership & Vision", agentIds: [6], color: "yellow" },
  { title: "Deflationary Forces", agentIds: [7], color: "cyan" },
  { title: "Innovation Velocity", agentIds: [8], color: "magenta" },
  { title: "5-Year Model", agentIds: [9], color: "green" },
  { title: "Contrarian Check", agentIds: [10], color: "white" },
];

// Valid verdicts and signals for Cathie
export const cathieValidVerdicts: readonly CathieVerdict[] = [
  "HIGH CONVICTION BUY",
  "CONVICTION BUY",
  "HOLD",
  "EXIT LEGACY",
  "TOO EARLY",
] as const;

export const cathieValidSignals: readonly CathieSignal[] = [
  "disruptive",
  "stagnant",
  "legacy",
  "insufficient_data",
] as const;

// Verdict color helper
function getCathieVerdictColor(verdict: string): string {
  switch (verdict) {
    case "HIGH CONVICTION BUY":
      return "magenta";
    case "CONVICTION BUY":
      return "green";
    case "HOLD":
      return "yellow";
    case "EXIT LEGACY":
      return "red";
    case "TOO EARLY":
      return "cyan";
    default:
      return "white";
  }
}

// Verdict symbol helper
function getCathieVerdictSymbol(verdict: string): string {
  switch (verdict) {
    case "HIGH CONVICTION BUY":
      return "**";
    case "CONVICTION BUY":
      return "+";
    case "HOLD":
      return "=";
    case "EXIT LEGACY":
      return "!";
    case "TOO EARLY":
      return "~";
    default:
      return "";
  }
}

// Signal color helper
function getCathieSignalColor(signal: string): string {
  switch (signal) {
    case "disruptive":
      return "magenta";
    case "stagnant":
      return "yellow";
    case "legacy":
      return "red";
    case "insufficient_data":
      return "gray";
    default:
      return "white";
  }
}

// Signal symbol helper
function getCathieSignalSymbol(signal: string): string {
  switch (signal) {
    case "disruptive":
      return "*";
    case "stagnant":
      return "~";
    case "legacy":
      return "!";
    case "insufficient_data":
      return "?";
    default:
      return " ";
  }
}

// Complete Cathie persona configuration
export const cathiePersona: PersonaConfig = {
  id: "cathie",
  name: "cathie",
  displayName: "Cathie Wood",
  description: "Disruptive innovation through Wright's Law, S-curves, and 5-year thinking",

  // Agent configurations
  agents: cathieAgents,

  // UI configuration
  categories: cathieCategories,
  agentGroups: cathieAgentGroups,

  // Synthesis configuration
  synthesis: cathieSynthesisConfig,

  // Verdict helpers
  validVerdicts: cathieValidVerdicts,
  validSignals: cathieValidSignals,

  // UI color/symbol helpers
  getVerdictColor: getCathieVerdictColor,
  getVerdictSymbol: getCathieVerdictSymbol,
  getSignalColor: getCathieSignalColor,
  getSignalSymbol: getCathieSignalSymbol,
};
