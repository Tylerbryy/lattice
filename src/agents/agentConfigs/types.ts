export interface AgentConfig {
  id: number;
  name: string;
  models: string[];
  systemPrompt: string;
  outputSchema: object;
}
