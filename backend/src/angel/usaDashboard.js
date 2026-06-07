/**
 * USA Market Dashboard Data
 * Returns S&P 500, NASDAQ, Dow Jones, Russell 2000, US Top Gainers, Losers, Market Breadth
 */

// Mock USA market data
const USA_INDICES = {
  "SPX": {
    key: "SPX",
    symbol: "S&P 500",
    ltp: 5932.45,
    open: 5910.20,
    high: 5945.80,
    low: 5895.30,
    close: 5932.45,
    percentChange: 0.85,
    volume: "2.1B",
    exchange: "US"
  },
  "INDU": {
    key: "INDU",
    symbol: "Dow Jones",
    ltp: 43847.50,
    open: 43650.20,
    high: 43920.00,
    low: 43600.00,
    close: 43847.50,
    percentChange: 0.45,
    volume: "245M",
    exchange: "US"
  },
  "CCMP": {
    key: "CCMP",
    symbol: "NASDAQ",
    ltp: 19285.30,
    open: 19120.50,
    high: 19310.80,
    low: 19050.00,
    close: 19285.30,
    percentChange: 0.86,
    volume: "1.8B",
    exchange: "US"
  },
  "RUT": {
    key: "RUT",
    symbol: "Russell 2000",
    ltp: 2165.42,
    open: 2145.80,
    high: 2175.30,
    low: 2140.00,
    close: 2165.42,
    percentChange: 0.92,
    volume: "685M",
    exchange: "US"
  }
};

const USA_SECTORS = [
  { name: "Technology", pct: "+1.24%", up: true, rawPct: 1.24 },
  { name: "Finance", pct: "+0.65%", up: true, rawPct: 0.65 },
  { name: "Healthcare", pct: "+0.42%", up: true, rawPct: 0.42 },
  { name: "Energy", pct: "+0.78%", up: true, rawPct: 0.78 },
  { name: "Consumer", pct: "-0.15%", up: false, rawPct: -0.15 },
  { name: "Industrials", pct: "+0.33%", up: true, rawPct: 0.33 },
  { name: "Materials", pct: "+0.22%", up: true, rawPct: 0.22 },
  { name: "Utilities", pct: "-0.08%", up: false, rawPct: -0.08 }
];

const USA_TOP_GAINERS = [
  { s: "NVDA", p: "$132.45", c: "+3.24%" },
  { s: "TSLA", p: "$287.50", c: "+2.85%" },
  { s: "MSFT", p: "$417.30", c: "+1.92%" },
  { s: "META", p: "$495.75", c: "+2.41%" }
];

const USA_TOP_LOSERS = [
  { s: "GE", p: "$165.20", c: "-2.15%" },
  { s: "BA", p: "$178.40", c: "-1.85%" },
  { s: "XOM", p: "$108.30", c: "-1.25%" },
  { s: "F", p: "$12.85", c: "-0.95%" }
];

const USA_EARNINGS_CALENDAR = [
  {
    name: "Apple Inc.",
    date: "Jan 28, 2025",
    status: "SCHEDULED"
  },
  {
    name: "Microsoft Corp",
    date: "Jan 30, 2025",
    status: "SCHEDULED"
  },
  {
    name: "Amazon.com Inc",
    date: "Jan 30, 2025",
    status: "SCHEDULED"
  },
  {
    name: "Google / Alphabet",
    date: "Jan 30, 2025",
    status: "SCHEDULED"
  },
  {
    name: "Meta Platforms",
    date: "Jan 29, 2025",
    status: "SCHEDULED"
  },
  {
    name: "Tesla Inc.",
    date: "Jan 28, 2025",
    status: "SCHEDULED"
  },
  {
    name: "Nvidia Corp",
    date: "Jan 22, 2025",
    status: "LIVE"
  },
  {
    name: "JPMorgan Chase",
    date: "Jan 14, 2025",
    status: "COMPLETED"
  }
];

async function getUSADashboardData() {
  // Calculate market breadth
  const sp500Advanced = Math.floor(Math.random() * 300) + 1900;
  const sp500Declined = Math.floor(Math.random() * 300) + 1700;
  const sp500Unchanged = 500 - sp500Advanced - sp500Declined;

  const ratioVal = sp500Declined > 0 ? (sp500Advanced / sp500Declined) : sp500Advanced;

  // Calculate sentiment based on indices performance
  let sentimentScore = 50;
  
  const spxPct = USA_INDICES.SPX.percentChange;
  const nasdaqPct = USA_INDICES.CCMP.percentChange;
  const djPct = USA_INDICES.INDU.percentChange;

  sentimentScore += Math.max(-20, Math.min(20, spxPct * 10));
  
  const totalBreadth = sp500Advanced + sp500Declined;
  if (totalBreadth > 0) {
    const breadthRatio = (sp500Advanced - sp500Declined) / totalBreadth;
    sentimentScore += breadthRatio * 30;
  }

  const positiveSectors = USA_SECTORS.filter(s => s.up).length;
  const totalSectors = USA_SECTORS.length;
  if (totalSectors > 0) {
    const sectorRatio = (positiveSectors / totalSectors) - 0.5;
    sentimentScore += sectorRatio * 20;
  }

  sentimentScore = Math.max(10, Math.min(90, sentimentScore));

  let sentimentValue = "Neutral";
  if (sentimentScore >= 60) sentimentValue = "Bullish";
  else if (sentimentScore <= 40) sentimentValue = "Bearish";

  const ratioStr = ratioVal.toFixed(2);
  const advDecText = `A/D ratio is ${ratioStr}:1 with ${sp500Advanced} advances and ${sp500Declined} declines.`;
  const spxText = `S&P 500 is ${spxPct >= 0 ? "up" : "down"} by ${Math.abs(spxPct).toFixed(2)}%`;
  const nasdaqText = `NASDAQ is ${nasdaqPct >= 0 ? "up" : "down"} by ${Math.abs(nasdaqPct).toFixed(2)}%`;
  const sectorText = `${positiveSectors} out of ${totalSectors} major sectors are advancing.`;

  const explanation = `${sentimentValue} outlook driven by market action: ${spxText}, ${nasdaqText}. Breadth is active with ${advDecText} Sector participation is supportive with ${sectorText}`;

  return {
    indices: [
      USA_INDICES.SPX,
      USA_INDICES.CCMP,
      USA_INDICES.INDU,
      USA_INDICES.RUT
    ],
    sectors: USA_SECTORS.map(s => ({ name: s.name, pct: s.pct, up: s.up })),
    gainers: USA_TOP_GAINERS,
    losers: USA_TOP_LOSERS,
    breadth: {
      advances: sp500Advanced,
      declines: sp500Declined,
      unchanged: sp500Unchanged,
      ratio: ratioStr,
      total: 5000
    },
    sentiment: {
      value: sentimentValue,
      score: Math.round(sentimentScore),
      explanation
    },
    earnings: USA_EARNINGS_CALENDAR.slice(0, 10),
    updatedAt: new Date().toISOString()
  };
}

module.exports = {
  getUSADashboardData
};
