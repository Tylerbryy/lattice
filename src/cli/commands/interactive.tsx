import React, { useState } from "react";
import { render, Box, Text, useApp, useInput } from "ink";
import { Select, TextInput, Confirm, Logo, Summary, type SelectItem } from "../components/Menu.js";
import { analyzeCommand } from "./analyze.js";
import { watchCommand } from "./watch.js";
import { mockCommand } from "./mock.js";
import { mockWatchCommand } from "./mock-watch.js";
import { setupCommand } from "./setup.js";
import { historyCommand } from "./history.js";
import { viewCommand } from "./view.js";
import { getPersona } from "../../personas/index.js";
import type { PersonaId } from "../../personas/types.js";

type Step = "action" | "persona" | "ticker" | "verbose" | "confirm" | "running";
type Action = "analyze" | "watch" | "history" | "view" | "setup" | "mock" | "mock-watch" | "exit";

interface AppState {
  action: Action | null;
  persona: PersonaId;
  ticker: string;
  verbose: boolean;
}

const actionItems: SelectItem<Action>[] = [
  {
    label: "Analyze Stock",
    value: "analyze",
    description: "Run full analysis with results",
    color: "green",
  },
  {
    label: "Watch Analysis",
    value: "watch",
    description: "Live dashboard showing agents at work",
    color: "cyan",
  },
  {
    label: "View History",
    value: "history",
    description: "Browse past analyses",
    color: "yellow",
  },
  {
    label: "View Saved",
    value: "view",
    description: "View a specific saved analysis",
    color: "yellow",
  },
  {
    label: "Setup",
    value: "setup",
    description: "Configure API keys",
    color: "magenta",
  },
  {
    label: "Mock Demo",
    value: "mock",
    description: "Preview UI with sample data",
    color: "gray",
  },
  {
    label: "Exit",
    value: "exit",
    description: "Quit Lattice",
    color: "red",
  },
];

const personaItems: SelectItem<PersonaId>[] = [
  {
    label: "Charlie Munger",
    value: "munger",
    description: "Value investing, margin of safety, mental models",
    color: "blue",
  },
  {
    label: "Cathie Wood",
    value: "cathie",
    description: "Disruptive innovation, 5-year horizons, S-curves",
    color: "magenta",
  },
];

function InteractiveApp() {
  const { exit } = useApp();
  const [step, setStep] = useState<Step>("action");
  const [state, setState] = useState<AppState>({
    action: null,
    persona: "munger",
    ticker: "",
    verbose: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Global escape handler to go back
  useInput((input, key) => {
    if (key.escape && step !== "action" && step !== "running") {
      // Go back one step
      if (step === "persona") setStep("action");
      else if (step === "ticker") setStep("persona");
      else if (step === "verbose") setStep("ticker");
      else if (step === "confirm") setStep("verbose");
    }
    if (input === "q" && step === "action") {
      exit();
    }
  }, { isActive: step !== "running" });

  const handleAction = async (action: Action) => {
    setState((prev) => ({ ...prev, action }));

    if (action === "exit") {
      exit();
      return;
    }

    if (action === "setup") {
      setStep("running");
      await setupCommand();
      exit();
      return;
    }

    if (action === "history") {
      setStep("running");
      await historyCommand({});
      exit();
      return;
    }

    if (action === "mock-watch") {
      setStep("running");
      await mockWatchCommand();
      exit();
      return;
    }

    // Actions that need persona selection
    if (action === "analyze" || action === "watch" || action === "mock") {
      setStep("persona");
    } else if (action === "view") {
      setStep("ticker");
    }
  };

  const handlePersona = (persona: PersonaId) => {
    setState((prev) => ({ ...prev, persona }));

    if (state.action === "mock") {
      setStep("verbose");
    } else {
      setStep("ticker");
    }
  };

  const handleTicker = (ticker: string) => {
    if (!ticker.trim()) {
      setError("Please enter a valid ticker symbol");
      return;
    }
    setError(null);
    setState((prev) => ({ ...prev, ticker: ticker.toUpperCase() }));

    if (state.action === "view") {
      runAction(ticker);
    } else {
      setStep("verbose");
    }
  };

  const handleVerbose = (verbose: boolean) => {
    setState((prev) => ({ ...prev, verbose }));
    setStep("confirm");
  };

  const handleConfirm = async (confirmed: boolean) => {
    if (!confirmed) {
      setStep("action");
      setState({ action: null, persona: "munger", ticker: "", verbose: false });
      return;
    }
    runAction();
  };

  const runAction = async (overrideTicker?: string) => {
    setStep("running");
    const ticker = overrideTicker || state.ticker;

    try {
      switch (state.action) {
        case "analyze":
          await analyzeCommand(ticker, {
            verbose: state.verbose,
            persona: state.persona,
          });
          break;
        case "watch":
          await watchCommand(ticker, {
            verbose: state.verbose,
            persona: state.persona,
          });
          break;
        case "mock":
          await mockCommand({
            verbose: state.verbose,
            persona: state.persona,
          });
          break;
        case "view":
          await viewCommand(ticker, { verbose: state.verbose });
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }

    exit();
  };

  const getPersonaDisplay = () => {
    const p = getPersona(state.persona);
    return p.displayName;
  };

  // Show current selections
  const getSummaryItems = () => {
    const items: Array<{ label: string; value: string; color?: string }> = [];
    if (state.action) {
      items.push({
        label: "Action",
        value: actionItems.find((a) => a.value === state.action)?.label || state.action,
        color: "green",
      });
    }
    if (step !== "action" && step !== "persona" && state.action !== "view") {
      items.push({
        label: "Persona",
        value: getPersonaDisplay(),
        color: state.persona === "cathie" ? "magenta" : "blue",
      });
    }
    if (state.ticker) {
      items.push({ label: "Ticker", value: state.ticker, color: "cyan" });
    }
    if (step === "confirm" || step === "running") {
      items.push({
        label: "Verbose",
        value: state.verbose ? "Yes" : "No",
        color: state.verbose ? "green" : "gray",
      });
    }
    return items;
  };

  if (step === "running") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="cyan">Starting...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Logo />

      {getSummaryItems().length > 0 && <Summary items={getSummaryItems()} />}

      {error && (
        <Box marginBottom={1}>
          <Text color="red">Error: {error}</Text>
        </Box>
      )}

      {step === "action" && (
        <Select
          items={actionItems}
          onSelect={handleAction}
          title="What would you like to do?"
        />
      )}

      {step === "persona" && (
        <Select
          items={personaItems}
          onSelect={handlePersona}
          title="Choose your investment persona:"
        />
      )}

      {step === "ticker" && (
        <TextInput
          value={state.ticker}
          onChange={(v) => setState((prev) => ({ ...prev, ticker: v }))}
          onSubmit={handleTicker}
          title={state.action === "view" ? "Enter ticker or analysis ID:" : "Enter stock ticker:"}
          placeholder="e.g., AAPL, TSLA, NVDA"
        />
      )}

      {step === "verbose" && (
        <Confirm
          message="Show detailed analysis (verbose mode)?"
          onConfirm={handleVerbose}
        />
      )}

      {step === "confirm" && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text bold color="cyan">Ready to run?</Text>
          </Box>
          <Confirm
            message={`Run ${state.action} for ${state.ticker || "mock data"}?`}
            onConfirm={handleConfirm}
          />
        </Box>
      )}

      <Box marginTop={2}>
        <Text dimColor>
          {step === "action" ? "Press Q to quit" : "Press ESC to go back"}
        </Text>
      </Box>
    </Box>
  );
}

export async function interactiveCommand(): Promise<void> {
  const { waitUntilExit } = render(<InteractiveApp />, { patchConsole: false });
  await waitUntilExit();
}
