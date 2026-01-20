import { Exa } from "exa-js";
import type { LatticeConfig } from "../../utils/config.js";

export interface ExaSearchInput {
  query: string;
  numResults?: number;
}

export interface ExaSearchResult {
  title: string;
  url: string;
  text: string;
}

interface ExaResult {
  title?: string;
  url: string;
  text?: string;
}

export const exaSearchToolDefinition = {
  name: "exa_search",
  description:
    "Search the web for current market information, news, company filings, analyst reports, and competitive intelligence. Use this to find real-time data not available in the provided financial snapshot.",
  input_schema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description:
          "Natural language search query. Be specific about what information you need (e.g., 'Apple iPhone 15 sales projections 2024', 'Tesla competitive threats from Chinese EV makers').",
      },
      numResults: {
        type: "number",
        description:
          "Number of results to return. Default is 5, maximum is 10. Use more results for broad research, fewer for specific queries.",
      },
    },
    required: ["query"],
  },
};

export async function handleExaSearch(
  input: ExaSearchInput,
  config: LatticeConfig
): Promise<string> {
  if (!config.exaApiKey) {
    return JSON.stringify({
      error: "Exa API key not configured. Web search is unavailable.",
      suggestion:
        "Set EXA_API_KEY environment variable or add exaApiKey to ~/.lattice/config.json",
    });
  }

  try {
    const exa = new Exa(config.exaApiKey);

    const numResults = Math.min(Math.max(input.numResults || 5, 1), 10);

    const searchResponse = await exa.searchAndContents(input.query, {
      numResults,
      text: true,
    });

    const results: ExaSearchResult[] = (searchResponse.results as ExaResult[]).map((r) => ({
      title: r.title || "Untitled",
      url: r.url,
      text: r.text?.slice(0, 1500) || "", // Truncate to manage context window
    }));

    return JSON.stringify({
      query: input.query,
      numResults: results.length,
      results,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return JSON.stringify({
      error: `Exa search failed: ${errorMessage}`,
      query: input.query,
    });
  }
}

export function isExaSearchAvailable(config: LatticeConfig): boolean {
  return Boolean(config.exaApiKey);
}
