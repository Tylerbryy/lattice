import { interactiveCommand } from "./commands/interactive.js";

export async function runCli(): Promise<void> {
  await interactiveCommand();
}
