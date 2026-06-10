import { marketApi } from "./marketApi";

export type StockOverview = {
  symbol: string;
  companyName: string;
  exchange: string;
  segment: string;
  sector: string;
  lastPrice: number | null;
  change: number | null;
  percentChange: number | null;
  marketCap: number | null;
  avgVolume: number | null;
  deliveryPercent: number | null;
  listingDate: string | null;
};

export type TechnicalAnalysis = {
  rsi: number | null;
  trend: "Uptrend" | "Neutral" | "Downtrend";
  momentum: "Strong" | "Moderate" | "Weak";
  support: number | null;
  resistance: number | null;
  score: number;
};

export type FundamentalAnalysis = {
  pe: number | null;
  pb: number | null;
  roe: number | null;
  roce: number | null;
  debtToEquity: number | null;
  promoterHolding: number | null;
  revenueGrowth: number | null;
  profitGrowth: number | null;
  score: number;
};

export type OperatorRiskAnalysis = {
  liquidityRisk: "Low" | "Moderate" | "High";
  volumeQuality: "High" | "Medium" | "Low";
  deliveryStrength: "Strong" | "Stable" | "Weak";
  operatorActivity: "Active" | "Moderate" | "Quiet";
  riskLevel: "Low" | "Moderate" | "High";
};

export type StockAnalysisData = {
  stockOverview: StockOverview;
  technical: TechnicalAnalysis;
  fundamental: FundamentalAnalysis;
  operatorRisk: OperatorRiskAnalysis;
  strengths: string[];
  risks: string[];
  overallScore: number;
  convictionScore: number;
  riskLevel: "Low" | "Moderate" | "High";
  suggestedAction: "Buy" | "Hold" | "Reduce";
  suggestedHoldingPeriod: string;
  aiVerdict: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function parseNumber(value: number | null | undefined) {
  return typeof value === "number" && !Number.isNaN(value) ? value : null;
}

function formatLarge(value: number) {
  if (value >= 1_000_000_000) return `${round(value / 1_000_000_000, 2)}T`;
  if (value >= 1_000_000) return `${round(value / 1_000_000, 2)}B`;
  if (value >= 1_000) return `${round(value / 1_000, 1)}M`;
  return `${round(value, 1)}`;
}

const VERDICTS: Record<"Low" | "Moderate" | "High", string> = {
  Low: "EquityMitra AI rates this stock as a high-conviction opportunity with structural support and earnings quality.",
  Moderate: "EquityMitra AI finds a balanced thesis. Use selective allocation and monitor near-term catalysts.",
  High: "EquityMitra AI recommends caution. Wait for clearer accumulation and improved liquidity before acting.",
};

function getSegment(marketCap: number | null) {
  if (marketCap == null) return "Data Unavailable";
  if (marketCap >= 2e11) return "Large Cap";
  if (marketCap >= 2e10) return "Mid Cap";
  if (marketCap >= 2e9) return "Small Cap";
  if (marketCap > 0) return "Micro Cap";
  return "Data Unavailable";
}

function buildTechnicalScore(
  percentChange: number | null,
  trend: TechnicalAnalysis["trend"],
  marketCap: number | null
) {
  let score = 50;
  if (trend === "Uptrend") score += 10;
  if (trend === "Downtrend") score -= 10;
  if (percentChange != null) score += clamp(percentChange * 1.5, -12, 12);
  if (marketCap != null) score += marketCap >= 2e11 ? 4 : marketCap <= 2e10 ? -2 : 0;
  return clamp(Math.round(score), 25, 90);
}

function buildFundamentalScore(fund: FundamentalAnalysis) {
  let score = 48;
  if (fund.pe != null) score += fund.pe < 18 ? 8 : fund.pe > 35 ? -8 : 0;
  if (fund.pb != null) score += fund.pb < 3 ? 5 : fund.pb > 6 ? -5 : 0;
  if (fund.roe != null) score += fund.roe >= 15 ? 8 : fund.roe < 8 ? -6 : 0;
  if (fund.roce != null) score += fund.roce >= 16 ? 6 : fund.roce < 10 ? -5 : 0;
  if (fund.debtToEquity != null) score += fund.debtToEquity <= 1 ? 5 : fund.debtToEquity >= 2 ? -5 : 0;
  if (fund.revenueGrowth != null) score += fund.revenueGrowth >= 10 ? 5 : fund.revenueGrowth < 0 ? -5 : 0;
  if (fund.profitGrowth != null) score += fund.profitGrowth >= 10 ? 5 : fund.profitGrowth < 0 ? -5 : 0;
  return clamp(Math.round(score), 30, 90);
}

function buildOperatorRisk(
  volume: number | null,
  percentChange: number | null,
  deliveryPercent: number | null
): OperatorRiskAnalysis {
  const liquidityRisk = volume == null ? "Moderate" : volume > 5_000_000 ? "Low" : "Moderate";
  const volumeQuality = volume == null ? "Medium" : volume > 10_000_000 ? "High" : volume > 3_000_000 ? "Medium" : "Low";
  const deliveryStrength = deliveryPercent == null ? "Stable" : deliveryPercent >= 40 ? "Strong" : deliveryPercent >= 25 ? "Stable" : "Weak";
  const operatorActivity = percentChange == null ? "Moderate" : Math.abs(percentChange) >= 4 ? "Active" : "Moderate";
  const riskScore = ((liquidityRisk as string) === "High" ? 2 : liquidityRisk === "Moderate" ? 1 : 0) + (operatorActivity === "Active" ? 2 : 0);
  const riskLevel = riskScore >= 3 ? "High" : riskScore === 2 ? "Moderate" : "Low";

  return {
    liquidityRisk,
    volumeQuality,
    deliveryStrength,
    operatorActivity,
    riskLevel,
  };
}

function buildStrengths(
  companyName: string,
  sector: string,
  quote: { lastPrice: number | null; percentChange: number | null },
  fundamentals: FundamentalAnalysis
) {
  const strengths: string[] = [];
  strengths.push(`Analysis is sourced from the latest quote and verified company metadata for ${companyName}.`);
  strengths.push(sector !== "Data Unavailable" ? `${sector} sector data is included where available.` : "Sector-level metadata is pending from external sources.");

  if (quote.percentChange != null) {
    strengths.push(
      `Latest session changed ${quote.percentChange >= 0 ? "up" : "down"} ${Math.abs(round(quote.percentChange, 2))}% on verified price data.`
    );
  }
  if (fundamentals.pe != null) {
    strengths.push(`Price-to-Earnings is derived from actual reported fundamentals.`);
  }
  if (fundamentals.roe != null) {
    strengths.push(`ROE is sourced from actual trailing financials.`);
  }
  return strengths.slice(0, 3);
}

function buildRisks(
  quote: { lastPrice: number | null; percentChange: number | null; open: number | null; low: number | null; high: number | null },
  fundamentals: FundamentalAnalysis
) {
  const risks: string[] = [];
  if (quote.percentChange != null && Math.abs(quote.percentChange) > 5) {
    risks.push("Price is exhibiting elevated volatility in the latest session.");
  }
  if (fundamentals.debtToEquity != null && fundamentals.debtToEquity > 1.5) {
    risks.push("Debt-to-equity is higher than conservative thresholds.");
  }
  if (fundamentals.pe != null && fundamentals.pe > 30) {
    risks.push("Valuation appears stretched relative to growth expectations.");
  }
  if (!risks.length) {
    risks.push("Current public data is limited; review fresh financial filings before committing.");
  }
  return risks.slice(0, 3);
}

function buildMarketCapDisplay(value: number | null) {
  return value == null ? "Data Unavailable" : `₹${formatLarge(value)}`;
}

function buildVolumeDisplay(value: number | null) {
  return value == null ? "Data Unavailable" : `${formatLarge(value)} shares`;
}

function buildPercentDisplay(value: number | null) {
  return value == null ? "Data Unavailable" : `${round(value, 2)}%`;
}

function buildCurrencyDisplay(value: number | null) {
  return value == null ? "Data Unavailable" : `₹${round(value, 2)}`;
}

export async function fetchStockAnalysis(symbol: string): Promise<StockAnalysisData> {
  const normalized = symbol.trim().toUpperCase();
  const quote = await marketApi.stock(normalized);

  const companyName = quote.companyName || quote.symbol;
  const sector = quote.sector || "Data Unavailable";
  const lastPrice = parseNumber(quote.ltp ?? quote.close);
  const openPrice = parseNumber(quote.open);
  const change = parseNumber(quote.netChange) ?? (lastPrice != null && openPrice != null ? lastPrice - openPrice : null);
  const percentChange = parseNumber(quote.percentChange) ?? (change != null && openPrice != null && openPrice !== 0 ? (change / openPrice) * 100 : null);
  const marketCap = parseNumber(quote.marketCap);
  const avgVolume = parseNumber(quote.volume);
  const hasBaseData =
    lastPrice != null ||
    openPrice != null ||
    marketCap != null ||
    quote.pe != null ||
    quote.pb != null ||
    quote.roe != null ||
    quote.revenueGrowth != null ||
    quote.profitGrowth != null;

  if (!hasBaseData) {
    throw new Error(
      "No reliable price or fundamental data is available for this symbol. Configure a supported provider or choose a different NSE stock."
    );
  }

  const rsi = null;
  const trend =
    lastPrice != null && openPrice != null
      ? lastPrice > openPrice * 1.01
        ? "Uptrend"
        : lastPrice < openPrice * 0.99
        ? "Downtrend"
        : "Neutral"
      : "Neutral";
  const momentum =
    percentChange == null
      ? "Moderate"
      : Math.abs(percentChange) >= 3
      ? "Strong"
      : Math.abs(percentChange) >= 1
      ? "Moderate"
      : "Weak";
  const support = parseNumber(quote.low);
  const resistance = parseNumber(quote.high);

  const technicalScore = buildTechnicalScore(percentChange, trend, marketCap);

  const fundamental: FundamentalAnalysis = {
    pe: parseNumber(quote.pe),
    pb: parseNumber(quote.pb),
    roe: parseNumber(quote.roe),
    roce: parseNumber(quote.roce),
    debtToEquity: parseNumber(quote.debtToEquity),
    promoterHolding: null,
    revenueGrowth: parseNumber(quote.revenueGrowth),
    profitGrowth: parseNumber(quote.profitGrowth),
    score: 0,
  };
  fundamental.score = buildFundamentalScore(fundamental);

  const companySegment = getSegment(marketCap);
  const operatorRisk = buildOperatorRisk(avgVolume, percentChange, null);
  const convictionScore = clamp(Math.round((technicalScore + fundamental.score) / 2), 30, 90);
  const overallScore = clamp(Math.round((technicalScore * 0.45 + fundamental.score * 0.35 + convictionScore * 0.2) / 1), 30, 90);
  const riskLevel = overallScore >= 70 ? "Low" : overallScore >= 50 ? "Moderate" : "High";
  const suggestedAction = overallScore >= 68 ? "Buy" : overallScore >= 50 ? "Hold" : "Reduce";
  const suggestedHoldingPeriod = overallScore >= 75 ? "12+ months" : overallScore >= 60 ? "6 - 12 months" : "3 - 6 months";

  const strengths = buildStrengths(companyName, sector, { lastPrice, percentChange }, fundamental);
  const risks = buildRisks({ lastPrice, percentChange, open: openPrice, low: support, high: resistance }, fundamental);

  return {
    stockOverview: {
      symbol: quote.symbol,
      companyName,
      exchange: quote.exchange || "NSE",
      segment: companySegment,
      sector,
      lastPrice,
      change,
      percentChange,
      marketCap,
      avgVolume,
      deliveryPercent: null,
      listingDate: null,
    },
    technical: {
      rsi,
      trend,
      momentum,
      support,
      resistance,
      score: technicalScore,
    },
    fundamental,
    operatorRisk,
    strengths,
    risks,
    overallScore,
    convictionScore,
    riskLevel,
    suggestedAction,
    suggestedHoldingPeriod,
    aiVerdict: VERDICTS[riskLevel] || "Use the facts above to guide disciplined allocation.",
  };
}
