// Re-export all Munger agent configurations from the existing agentConfigs
export { agent1CoreInvestment } from "../../agents/agentConfigs/agent1-coreInvestment.js";
export { agent2MoatsOwner } from "../../agents/agentConfigs/agent2-moatsOwner.js";
export { agent3Psychology1 } from "../../agents/agentConfigs/agent3-psychology1.js";
export { agent4Psychology2 } from "../../agents/agentConfigs/agent4-psychology2.js";
export { agent5Lollapalooza } from "../../agents/agentConfigs/agent5-lollapalooza.js";
export { agent6MathProb } from "../../agents/agentConfigs/agent6-mathProb.js";
export { agent7MathEcon } from "../../agents/agentConfigs/agent7-mathEcon.js";
export { agent8Economics } from "../../agents/agentConfigs/agent8-economics.js";
export { agent9Systems } from "../../agents/agentConfigs/agent9-systems.js";
export { agent10DecisionFilters } from "../../agents/agentConfigs/agent10-decisionFilters.js";

import { agent1CoreInvestment } from "../../agents/agentConfigs/agent1-coreInvestment.js";
import { agent2MoatsOwner } from "../../agents/agentConfigs/agent2-moatsOwner.js";
import { agent3Psychology1 } from "../../agents/agentConfigs/agent3-psychology1.js";
import { agent4Psychology2 } from "../../agents/agentConfigs/agent4-psychology2.js";
import { agent5Lollapalooza } from "../../agents/agentConfigs/agent5-lollapalooza.js";
import { agent6MathProb } from "../../agents/agentConfigs/agent6-mathProb.js";
import { agent7MathEcon } from "../../agents/agentConfigs/agent7-mathEcon.js";
import { agent8Economics } from "../../agents/agentConfigs/agent8-economics.js";
import { agent9Systems } from "../../agents/agentConfigs/agent9-systems.js";
import { agent10DecisionFilters } from "../../agents/agentConfigs/agent10-decisionFilters.js";
import type { AgentConfig } from "../../agents/agentConfigs/types.js";

export const mungerAgents: AgentConfig[] = [
  agent1CoreInvestment,
  agent2MoatsOwner,
  agent3Psychology1,
  agent4Psychology2,
  agent5Lollapalooza,
  agent6MathProb,
  agent7MathEcon,
  agent8Economics,
  agent9Systems,
  agent10DecisionFilters,
];
