export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatLargeNumber(value: number): string {
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

export function parseFinvizNumber(str: string): number | null {
  if (!str || str === "-") return null;

  // Remove commas and handle percentages
  let cleaned = str.replace(/,/g, "").trim();

  // Handle percentages
  if (cleaned.endsWith("%")) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? null : num / 100;
  }

  // Handle suffixes (B, M, K)
  const suffix = cleaned.slice(-1).toUpperCase();
  const numPart = cleaned.slice(0, -1);

  switch (suffix) {
    case "T":
      return parseFloat(numPart) * 1e12;
    case "B":
      return parseFloat(numPart) * 1e9;
    case "M":
      return parseFloat(numPart) * 1e6;
    case "K":
      return parseFloat(numPart) * 1e3;
    default:
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}
