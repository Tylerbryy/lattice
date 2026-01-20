import * as cheerio from "cheerio";
import type { FinvizData, NewsItem } from "./types.js";

const FINVIZ_URL = "https://finviz.com/quote.ashx?t={symbol}&p=d";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

function parsePercentage(value: string): string {
  if (!value || value === "-") return "-";
  return value.trim();
}

function parseNumber(value: string): string {
  if (!value || value === "-") return "-";
  return value.replace("$", "").replace(",", "").trim();
}

function parseNews($: cheerio.CheerioAPI): NewsItem[] {
  const news: NewsItem[] = [];
  const newsTable = $("table.fullview-news-outer");

  newsTable.find("tr").each((_, row) => {
    const dateCell = $(row).find("td").first();
    const linkCell = $(row).find("td").last();
    const link = linkCell.find("a");

    if (link.length > 0) {
      const title = link.text().trim();
      const href = link.attr("href") || "";
      const source = linkCell.find("span").text().trim();
      const date = dateCell.text().trim();

      if (title) {
        news.push({
          title,
          link: href,
          source,
          date,
        });
      }
    }
  });

  return news.slice(0, 10);
}

export async function scrapeFinviz(ticker: string): Promise<FinvizData> {
  const url = FINVIZ_URL.replace("{symbol}", ticker.toUpperCase());

  const response = await fetch(url, { headers: HEADERS });

  if (!response.ok) {
    throw new Error(`Failed to fetch data for ${ticker}: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Find the snapshot-table2 which contains all the metrics
  const table = $("table.snapshot-table2");
  if (table.length === 0) {
    throw new Error(`Could not find data table for ${ticker}`);
  }

  // Build a dict of all label -> value pairs
  const dataDict: Record<string, string> = {};
  const rows = table.find("tr");

  rows.each((_, row) => {
    const cells = $(row).find("td");
    // Cells come in pairs: label, value, label, value, ...
    for (let i = 0; i < cells.length - 1; i += 2) {
      const label = $(cells[i]).text().trim();
      const value = $(cells[i + 1]).text().trim();
      dataDict[label] = value;
    }
  });

  // Parse volatility (format: "5.37% 4.55%" for week/month)
  const volStr = dataDict["Volatility"] || "";
  const volParts = volStr.split(/\s+/);
  const volWeek = volParts[0] || "-";
  const volMonth = volParts[1] || "-";

  // Get current price from the page
  const priceElem = $("strong.quote-price_wrapper_price");
  const currentPrice = priceElem.length > 0 ? priceElem.text().trim() : dataDict["Price"] || "-";

  // Get price change
  const changeElem = $("span.quote-price_wrapper_change");
  let changePct = "-";
  if (changeElem.length > 0) {
    const changeText = changeElem.text().trim();
    const match = changeText.match(/\(([-\d.]+)%\)/);
    if (match) {
      changePct = `${match[1]}%`;
    }
  }
  if (changePct === "-") {
    changePct = dataDict["Change"] || "-";
  }

  // Extract company name from title or page
  const title = $("title").text().trim();
  const titleMatch = title.match(/^[A-Z]+ - (.+?) Stock/);
  const companyName = titleMatch ? titleMatch[1] : ticker;

  // Extract sector/industry from links with specific href patterns
  let sector = "-";
  let industry = "-";
  let country = "-";

  $("a.tab-link").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    if (href.includes("sec_")) {
      sector = text;
    } else if (href.includes("ind_")) {
      industry = text;
    } else if (href.includes("geo_")) {
      country = text;
    }
  });

  // Extract description
  const description = $("td.fullview-profile").text().trim() || "-";

  const data: FinvizData = {
    ticker: ticker.toUpperCase(),
    companyName,
    sector,
    industry,
    country,
    description,

    // Market data
    marketCap: dataDict["Market Cap"] || "-",
    price: currentPrice,
    change: changePct,
    volume: dataDict["Volume"] || "-",

    // Valuation
    pe: parseNumber(dataDict["P/E"] || ""),
    forwardPE: parseNumber(dataDict["Forward P/E"] || ""),
    peg: parseNumber(dataDict["PEG"] || ""),
    ps: parseNumber(dataDict["P/S"] || ""),
    pb: parseNumber(dataDict["P/B"] || ""),
    pCash: parseNumber(dataDict["P/Cash"] || ""),
    pFree: parseNumber(dataDict["P/Free Cash Flow"] || ""),

    // Growth
    epsThisY: parsePercentage(dataDict["EPS this Y"] || ""),
    epsNextY: parsePercentage(dataDict["EPS next Y"] || ""),
    epsNext5Y: parsePercentage(dataDict["EPS next 5Y"] || ""),
    epsPast5Y: parsePercentage(dataDict["EPS past 5Y"] || ""),
    salesPast5Y: parsePercentage(dataDict["Sales past 5Y"] || ""),
    salesQQ: parsePercentage(dataDict["Sales Q/Q"] || ""),
    epsQQ: parsePercentage(dataDict["EPS Q/Q"] || ""),

    // Margins & returns
    grossMargin: parsePercentage(dataDict["Gross Margin"] || ""),
    operMargin: parsePercentage(dataDict["Oper. Margin"] || ""),
    profitMargin: parsePercentage(dataDict["Profit Margin"] || ""),
    roe: parsePercentage(dataDict["ROE"] || ""),
    roi: parsePercentage(dataDict["ROI"] || ""),
    roa: parsePercentage(dataDict["ROA"] || ""),

    // Balance sheet
    currentRatio: parseNumber(dataDict["Current Ratio"] || ""),
    quickRatio: parseNumber(dataDict["Quick Ratio"] || ""),
    ltDebtEq: parseNumber(dataDict["LT Debt/Eq"] || ""),
    debtEq: parseNumber(dataDict["Debt/Eq"] || ""),

    // Dividend
    dividend: dataDict["Dividend"] || "-",
    dividendYield: parsePercentage(dataDict["Dividend %"] || ""),
    payoutRatio: parsePercentage(dataDict["Payout"] || ""),

    // Analyst
    targetPrice: parseNumber(dataDict["Target Price"] || ""),
    recom: parseNumber(dataDict["Recom"] || ""),

    // Performance
    perf52W: dataDict["52W Range"] || "-",
    perfYTD: parsePercentage(dataDict["Perf YTD"] || ""),
    perfMonth: parsePercentage(dataDict["Perf Month"] || ""),
    perfQuarter: parsePercentage(dataDict["Perf Quarter"] || ""),

    // Volatility
    beta: parseNumber(dataDict["Beta"] || ""),
    volatility: `${volWeek} ${volMonth}`.trim(),

    // Technical
    shortFloat: parsePercentage(dataDict["Short Float"] || ""),
    shortRatio: parseNumber(dataDict["Short Ratio"] || ""),
    insiderOwn: parsePercentage(dataDict["Insider Own"] || ""),
    instOwn: parsePercentage(dataDict["Inst Own"] || ""),
    sma20: parsePercentage(dataDict["SMA20"] || ""),
    sma50: parsePercentage(dataDict["SMA50"] || ""),
    sma200: parsePercentage(dataDict["SMA200"] || ""),
    rsi14: parseNumber(dataDict["RSI (14)"] || ""),

    // News
    news: parseNews($),
  };

  return data;
}

export function formatFinvizDataForPrompt(data: FinvizData): string {
  return `
## Company Overview
- **Company**: ${data.companyName} (${data.ticker})
- **Sector**: ${data.sector}
- **Industry**: ${data.industry}
- **Country**: ${data.country}
- **Market Cap**: ${data.marketCap}
- **Current Price**: ${data.price} (${data.change})
- **Volume**: ${data.volume}

## Description
${data.description}

## Valuation Metrics
| Metric | Value |
|--------|-------|
| P/E | ${data.pe} |
| Forward P/E | ${data.forwardPE} |
| PEG | ${data.peg} |
| P/S | ${data.ps} |
| P/B | ${data.pb} |
| P/Cash | ${data.pCash} |
| P/Free Cash Flow | ${data.pFree} |

## Growth Metrics
| Metric | Value |
|--------|-------|
| EPS This Year | ${data.epsThisY} |
| EPS Next Year | ${data.epsNextY} |
| EPS Next 5Y | ${data.epsNext5Y} |
| EPS Past 5Y | ${data.epsPast5Y} |
| Sales Past 5Y | ${data.salesPast5Y} |
| Sales Q/Q | ${data.salesQQ} |
| EPS Q/Q | ${data.epsQQ} |

## Profitability & Returns
| Metric | Value |
|--------|-------|
| Gross Margin | ${data.grossMargin} |
| Operating Margin | ${data.operMargin} |
| Profit Margin | ${data.profitMargin} |
| ROE | ${data.roe} |
| ROI | ${data.roi} |
| ROA | ${data.roa} |

## Financial Health
| Metric | Value |
|--------|-------|
| Current Ratio | ${data.currentRatio} |
| Quick Ratio | ${data.quickRatio} |
| LT Debt/Equity | ${data.ltDebtEq} |
| Debt/Equity | ${data.debtEq} |

## Dividend
| Metric | Value |
|--------|-------|
| Dividend | ${data.dividend} |
| Dividend Yield | ${data.dividendYield} |
| Payout Ratio | ${data.payoutRatio} |

## Analyst Data
| Metric | Value |
|--------|-------|
| Target Price | ${data.targetPrice} |
| Recommendation | ${data.recom} |

## Performance
| Metric | Value |
|--------|-------|
| 52W Range | ${data.perf52W} |
| YTD Performance | ${data.perfYTD} |
| Monthly Performance | ${data.perfMonth} |
| Quarterly Performance | ${data.perfQuarter} |

## Technical Indicators
| Metric | Value |
|--------|-------|
| Beta | ${data.beta} |
| Volatility | ${data.volatility} |
| SMA20 | ${data.sma20} |
| SMA50 | ${data.sma50} |
| SMA200 | ${data.sma200} |
| RSI (14) | ${data.rsi14} |

## Ownership & Short Interest
| Metric | Value |
|--------|-------|
| Short Float | ${data.shortFloat} |
| Short Ratio | ${data.shortRatio} |
| Insider Ownership | ${data.insiderOwn} |
| Institutional Ownership | ${data.instOwn} |

## Recent News
${data.news.map((n) => `- [${n.date}] ${n.title} (${n.source})`).join("\n")}
`.trim();
}
