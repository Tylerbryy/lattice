import React, { useState } from "react";
import { render, Box, Text, useInput, useApp } from "ink";
import TextInput from "ink-text-input";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

type Step = "welcome" | "anthropic" | "exa" | "confirm" | "done";

interface Config {
  anthropicApiKey: string;
  exaApiKey?: string;
}

function SetupApp() {
  const { exit } = useApp();
  const [step, setStep] = useState<Step>("welcome");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [exaKey, setExaKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useInput((input, key) => {
    if (step === "welcome" && (key.return || input === " ")) {
      setStep("anthropic");
    }
    if (step === "confirm") {
      if (input === "y" || input === "Y" || key.return) {
        saveConfig();
      } else if (input === "n" || input === "N") {
        setStep("anthropic");
      }
    }
    if (step === "done" && (key.return || key.escape)) {
      exit();
    }
  });

  const saveConfig = () => {
    try {
      const configDir = path.join(os.homedir(), ".lattice");
      const configPath = path.join(configDir, "config.json");

      // Create directory if it doesn't exist
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      const config: Config = {
        anthropicApiKey: anthropicKey,
      };

      if (exaKey.trim()) {
        config.exaApiKey = exaKey;
      }

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      setSaved(true);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save config");
    }
  };

  const handleAnthropicSubmit = (value: string) => {
    if (!value.trim()) {
      setError("Anthropic API key is required");
      return;
    }
    setError(null);
    setAnthropicKey(value);
    setStep("exa");
  };

  const handleExaSubmit = (value: string) => {
    setExaKey(value);
    setStep("confirm");
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return "••••••••";
    return key.slice(0, 7) + "•".repeat(Math.min(key.length - 7, 20)) + key.slice(-4);
  };

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text backgroundColor="cyan" color="black" bold> LATTICE </Text>
        <Text bold color="cyan"> Setup</Text>
      </Box>

      {step === "welcome" && (
        <Box flexDirection="column">
          <Text>Welcome to Lattice setup!</Text>
          <Text dimColor>This will configure your API keys for stock analysis.</Text>
          <Box marginTop={1}>
            <Text dimColor>Press </Text>
            <Text color="cyan">Enter</Text>
            <Text dimColor> to continue...</Text>
          </Box>
        </Box>
      )}

      {step === "anthropic" && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text bold color="yellow">1/2 </Text>
            <Text bold>Anthropic API Key </Text>
            <Text color="red">(required)</Text>
          </Box>
          <Text dimColor>Get your key at: https://console.anthropic.com/settings/keys</Text>
          <Box marginTop={1}>
            <Text color="cyan">› </Text>
            <TextInput
              value={anthropicKey}
              onChange={setAnthropicKey}
              onSubmit={handleAnthropicSubmit}
              placeholder="sk-ant-..."
              mask="*"
            />
          </Box>
          {error && (
            <Box marginTop={1}>
              <Text color="red">✗ {error}</Text>
            </Box>
          )}
        </Box>
      )}

      {step === "exa" && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text bold color="yellow">2/2 </Text>
            <Text bold>Exa API Key </Text>
            <Text dimColor>(optional - enables web search)</Text>
          </Box>
          <Text dimColor>Get your key at: https://dashboard.exa.ai/api-keys</Text>
          <Text dimColor>Press Enter to skip</Text>
          <Box marginTop={1}>
            <Text color="cyan">› </Text>
            <TextInput
              value={exaKey}
              onChange={setExaKey}
              onSubmit={handleExaSubmit}
              placeholder="exa-..."
              mask="*"
            />
          </Box>
        </Box>
      )}

      {step === "confirm" && (
        <Box flexDirection="column">
          <Text bold>Confirm your configuration:</Text>
          <Box marginTop={1} flexDirection="column">
            <Box>
              <Text dimColor>Anthropic API Key: </Text>
              <Text color="green">{maskKey(anthropicKey)}</Text>
            </Box>
            <Box>
              <Text dimColor>Exa API Key: </Text>
              <Text color={exaKey ? "green" : "gray"}>
                {exaKey ? maskKey(exaKey) : "(not configured)"}
              </Text>
            </Box>
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text dimColor>Config will be saved to: ~/.lattice/config.json</Text>
          </Box>
          <Box marginTop={1}>
            <Text>Save this configuration? </Text>
            <Text color="cyan">[Y/n]</Text>
          </Box>
        </Box>
      )}

      {step === "done" && (
        <Box flexDirection="column">
          <Box>
            <Text color="green">✓ </Text>
            <Text bold color="green">Configuration saved!</Text>
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text dimColor>You're all set. Try running:</Text>
            <Box marginTop={1}>
              <Text color="cyan">  lattice analyze AAPL</Text>
            </Box>
            <Box>
              <Text color="cyan">  lattice watch NVDA</Text>
            </Box>
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Press Enter to exit...</Text>
          </Box>
        </Box>
      )}

      {error && step === "confirm" && (
        <Box marginTop={1}>
          <Text color="red">✗ {error}</Text>
        </Box>
      )}
    </Box>
  );
}

export async function setupCommand(): Promise<void> {
  const { waitUntilExit } = render(<SetupApp />, { patchConsole: false });
  await waitUntilExit();
}
