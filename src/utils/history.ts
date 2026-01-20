import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { AnalysisResult } from "../data/types.js";

const HISTORY_DIR = path.join(os.homedir(), ".lattice", "history");

export interface SavedAnalysis {
  id: string;
  ticker: string;
  companyName: string;
  timestamp: string;
  elapsedTime: number;
  verdict: string;
  result: AnalysisResult;
}

export interface AnalysisSummary {
  id: string;
  ticker: string;
  companyName: string;
  timestamp: string;
  verdict: string;
  price: string;
}

function ensureHistoryDir(): void {
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function saveAnalysis(result: AnalysisResult, elapsedTime: number): string {
  ensureHistoryDir();

  const id = generateId();
  const timestamp = new Date().toISOString();

  const savedAnalysis: SavedAnalysis = {
    id,
    ticker: result.ticker,
    companyName: result.financialData.companyName,
    timestamp,
    elapsedTime,
    verdict: result.finalAnalysis.verdict,
    result,
  };

  const filename = `${result.ticker.toLowerCase()}-${id}.json`;
  const filepath = path.join(HISTORY_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(savedAnalysis, null, 2));

  return id;
}

export function listAnalyses(): AnalysisSummary[] {
  ensureHistoryDir();

  const files = fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith(".json"));
  const analyses: AnalysisSummary[] = [];

  for (const file of files) {
    try {
      const filepath = path.join(HISTORY_DIR, file);
      const content = fs.readFileSync(filepath, "utf-8");
      const saved = JSON.parse(content) as SavedAnalysis;

      analyses.push({
        id: saved.id,
        ticker: saved.ticker,
        companyName: saved.companyName,
        timestamp: saved.timestamp,
        verdict: saved.verdict,
        price: saved.result.financialData.price,
      });
    } catch {
      // Skip invalid files
    }
  }

  // Sort by timestamp descending (newest first)
  return analyses.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getAnalysis(idOrTicker: string): SavedAnalysis | null {
  ensureHistoryDir();

  const files = fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith(".json"));

  // Try to find by ID first
  for (const file of files) {
    if (file.includes(idOrTicker)) {
      try {
        const filepath = path.join(HISTORY_DIR, file);
        const content = fs.readFileSync(filepath, "utf-8");
        return JSON.parse(content) as SavedAnalysis;
      } catch {
        // Skip invalid files
      }
    }
  }

  // Try to find by ticker (return most recent)
  const tickerLower = idOrTicker.toLowerCase();
  const matchingFiles = files
    .filter((f) => f.startsWith(tickerLower + "-"))
    .sort()
    .reverse();

  if (matchingFiles.length > 0) {
    try {
      const filepath = path.join(HISTORY_DIR, matchingFiles[0]);
      const content = fs.readFileSync(filepath, "utf-8");
      return JSON.parse(content) as SavedAnalysis;
    } catch {
      // Skip invalid files
    }
  }

  return null;
}

export function deleteAnalysis(id: string): boolean {
  ensureHistoryDir();

  const files = fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    if (file.includes(id)) {
      try {
        const filepath = path.join(HISTORY_DIR, file);
        fs.unlinkSync(filepath);
        return true;
      } catch {
        return false;
      }
    }
  }

  return false;
}

export function clearHistory(): number {
  ensureHistoryDir();

  const files = fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith(".json"));
  let deleted = 0;

  for (const file of files) {
    try {
      const filepath = path.join(HISTORY_DIR, file);
      fs.unlinkSync(filepath);
      deleted++;
    } catch {
      // Skip
    }
  }

  return deleted;
}
