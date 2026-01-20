import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface LatticeConfig {
  anthropicApiKey: string;
  exaApiKey?: string;
}

const CONFIG_DIR = path.join(os.homedir(), ".lattice");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

function loadConfigFile(): Partial<LatticeConfig> {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch {
    // Config file doesn't exist or is invalid
  }
  return {};
}

export function loadConfig(): LatticeConfig {
  const fileConfig = loadConfigFile();

  const anthropicApiKey =
    process.env.ANTHROPIC_API_KEY || fileConfig.anthropicApiKey;
  const exaApiKey = process.env.EXA_API_KEY || fileConfig.exaApiKey;

  if (!anthropicApiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is required. Set it via environment variable or in ~/.lattice/config.json"
    );
  }

  return {
    anthropicApiKey,
    exaApiKey,
  };
}

export function hasExaApiKey(config: LatticeConfig): boolean {
  return Boolean(config.exaApiKey);
}
