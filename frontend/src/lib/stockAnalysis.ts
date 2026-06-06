export type StockOverview = {
  symbol: string;
  companyName: string;
  exchange: string;
  segment: string;
  sector: string;
  lastPrice: number;
  change: number;
  percentChange: number;
  marketCap: string;
  avgVolume: string;
  deliveryPercent: number;
  listingDate: string;
};

export type TechnicalAnalysis = {
  rsi: number;
  trend: "Uptrend" | "Neutral" | "Downtrend";
  momentum: "Strong" | "Moderate" | "Weak";
  support: number;
  resistance: number;
  score: number;
};

export type FundamentalAnalysis = {
  pe: number;
  pb: number;
  roe: number;
  roce: number;
  debtToEquity: number;
  promoterHolding: number;
  revenueGrowth: number;
  profitGrowth: number;
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

function hashCode(value: string) {
  return value
    .toUpperCase()
    .split("")
    .reduce((sum, char) => sum + char.codePointAt(0) ?? 0, 0);
}

function choose<T>(options: T[], seed: number) {
  return options[seed % options.length];
}

function formatLarge(value: number) {
  if (value >= 1_000_000_000) return `${round(value / 1_000_000_000, 2)}T`;
  if (value >= 1_000_000) return `${round(value / 1_000_000, 2)}B`;
  if (value >= 1_000) return `${round(value / 1_000, 1)}M`;
  return `${round(value, 1)}`;
}

const SECTORS = [
  "Financials",
  "Technology",
  "Consumer Goods",
  "Energy",
  "Pharma",
  "Auto",
  "Materials",
  "Services",
  "Healthcare",
  "Utilities",
];

const SEGMENTS = ["Large Cap", "Mid Cap", "Small Cap", "Micro Cap", "SME"];

const ACTIONS: Record<string, string> = {
  Low: "Add to your watchlist and accumulate on weakness.",
  Moderate: "Buy selectively with a defined stop loss.",
  High: "Avoid new positions until risk clears.",
};

const VERDICTS = {
  Low: "EquityMitra AI rates this stock as a high-conviction opportunity with structural support and earnings quality.",
  Moderate: "EquityMitra AI finds a balanced thesis. Use selective allocation and monitor near-term catalysts.",
  High: "EquityMitra AI recommends caution. Wait for clearer accumulation and improved liquidity before acting.",
};

export function generateStockAnalysis(symbol: string): StockAnalysisData {
  const normalized = symbol.trim().toUpperCase() || "NSE";
  const seed = hashCode(normalized);
  const priceBase = clamp(25 + (seed % 940), 30, 980);
  const isBullish = seed % 5 !== 0;

  const technicalScore = clamp(45 + (seed % 50) + (isBullish ? 5 : -5), 35, 98);
  const fundamentalScore = clamp(40 + ((seed * 3) % 50) - (seed % 7), 32, 96);
  const convictionScore = clamp(Math.round((technicalScore * 0.4 + fundamentalScore * 0.4 + 20) / 1), 35, 98);
  const overallScore = clamp(Math.round((technicalScore * 0.36 + fundamentalScore * 0.36 + convictionScore * 0.28) / 1), 36, 99);

  const riskLevel = overallScore >= 72 ? "Low" : overallScore >= 52 ? "Moderate" : "High";
  const suggestedAction = overallScore >= 70 ? "Buy" : overallScore >= 50 ? "Hold" : "Reduce";
  const suggestedHoldingPeriod = overallScore >= 80 ? "12+ months" : overallScore >= 60 ? "6 - 12 months" : "3 - 6 months";

  const trend = choose<"Uptrend" | "Neutral" | "Downtrend">(["Uptrend", "Neutral", "Downtrend"], seed);
  const momentum = choose<"Strong" | "Moderate" | "Weak">(["Strong", "Moderate", "Weak"], seed + 1);
  const technicalRsi = clamp(30 + (seed % 50) + (trend === "Uptrend" ? 5 : trend === "Downtrend" ? -3 : 0), 28, 78);

  const support = round(priceBase - clamp(3 + (seed % 22), 3, 22), 2);
  const resistance = round(priceBase + clamp(3 + ((seed + 7) % 26), 4, 29), 2);

  const pe = clamp(8 + (seed % 28) + (fundamentalScore > 72 ? 8 : 0), 9, 62);
  const pb = clamp(0.8 + ((seed % 12) * 0.15), 0.8, 4.9);
  const roe = clamp(8 + ((seed + 9) % 27), 8, 32);
  const roce = clamp(10 + ((seed + 12) % 29), 10, 38);
  const debtToEquity = clamp(0.2 + ((seed % 40) * 0.05), 0.2, 2.4);
  const promoterHolding = clamp(18 + ((seed + 6) % 56), 18, 78);
  const revenueGrowth = clamp(3 + ((seed + 3) % 32), 3, 35);
  const profitGrowth = clamp(2 + ((seed + 5) % 30), 2, 32);

  const liquidityRisk = overallScore >= 72 ? "Low" : overallScore >= 50 ? "Moderate" : "High";
  const volumeQuality = seed % 3 === 0 ? "High" : seed % 3 === 1 ? "Medium" : "Low";
  const deliveryStrength = seed % 4 === 0 ? "Strong" : seed % 4 === 1 ? "Stable" : "Weak";
  const operatorActivity = seed % 2 === 0 ? "Active" : "Moderate";

  const strengths = [
    choose([
      "Structural trend confirmed by premium volume",
      "Sector leadership with consistent relative strength",
      "Strong cash conversion and working capital discipline",
      "Healthy delivery ratio and institutional support",
      "Market-friendly management commentary with execution clarity",
    ], seed),
    choose([
      "Technical score indicates a resilient thesis",
      "Fundamental metrics are above industry averages",
      "Low operator risk relative to peers",
      "Reward/risk profile favors disciplined accumulation",
      "AI verdict supports selective long-term exposure",
    ], seed + 7),
  ];

  const risks = [
    choose([
      "Price is extended above first resistance zone",
      "Debt levels require ongoing execution discipline",
      "Liquidity could compress on broader market weakness",
      "Promoter stake is high, leaving limited free float",
      "Earnings outcome is sensitive to margin recovery",
    ], seed + 4),
    choose([
      "Operator activity is elevated in the near term",
      "Growth expectations are priced in at current levels",
      "Sector volatility may widen around events",
      "Delivery percentage is moderate for the current market phase",
      "Fundamental score needs revenue growth to sustain the thesis",
    ], seed + 11),
  ];

  const segment = choose(SEGMENTS, seed % SEGMENTS.length);
  const sector = choose(SECTORS, seed % SECTORS.length);
  const marketCapValue = priceBase * clamp((seed % 580) + 70, 75, 820);
  const marketCap = `${formatLarge(marketCapValue * 1_000_000)} INR`;
  const avgVolumeValue = clamp((seed % 320) + 12, 12, 320) * 1000;

  return {
    stockOverview: {
      symbol: normalized,
      companyName: `${normalized} Industries Limited`,
      exchange: "NSE",
      segment,
      sector,
      lastPrice: round(priceBase, 2),
      change: round((isBullish ? 1 : -1) * (0.8 + ((seed % 45) * 0.14)), 2),
      percentChange: round((isBullish ? 1 : -1) * (0.4 + ((seed % 28) * 0.12)), 2),
      marketCap,
      avgVolume: `${formatLarge(avgVolumeValue)} shares`,
      deliveryPercent: clamp(25 + ((seed + 19) % 46), 25, 70),
      listingDate: `${2010 + (seed % 13)}-${String((seed % 12) + 1).padStart(2, "0")}-01`,
    },
    technical: {
      rsi: technicalRsi,
      trend,
      momentum,
      support,
      resistance,
      score: technicalScore,
    },
    fundamental: {
      pe,
      pb: round(pb, 2),
      roe,
      roce,
      debtToEquity: round(debtToEquity, 2),
      promoterHolding,
      revenueGrowth,
      profitGrowth,
      score: fundamentalScore,
    },
    operatorRisk: {
      liquidityRisk,
      volumeQuality,
      deliveryStrength,
      operatorActivity,
      riskLevel,
    },
    strengths,
    risks,
    overallScore,
    convictionScore,
    riskLevel,
    suggestedAction: suggestedAction as "Buy" | "Hold" | "Reduce",
    suggestedHoldingPeriod,
    aiVerdict: VERDICTS[riskLevel],
  };
}
