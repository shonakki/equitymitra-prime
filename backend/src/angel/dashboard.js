const { fetchQuote } = require("./market");
const sectorsConfig = require("./sectors.json");

const SECTOR_KEYS = Object.keys(sectorsConfig);
const ALL_CONSTITUENTS = Array.from(
  new Set(Object.values(sectorsConfig).flat())
);

async function getDashboardData() {
  const queryKeys = [...ALL_CONSTITUENTS, "NIFTY", "BANKNIFTY"];
  const { data } = await fetchQuote(queryKeys);
  
  const quoteMap = {};
  for (const q of data) {
    if (q && q.key) {
      quoteMap[q.key] = q;
    }
  }

  // 1. Sector Performance
  const sectorPerformance = SECTOR_KEYS.map(sectorName => {
    const symbols = sectorsConfig[sectorName];
    let totalChange = 0;
    let count = 0;

    for (const sym of symbols) {
      const q = quoteMap[sym];
      if (q && typeof q.percentChange === "number") {
        totalChange += q.percentChange;
        count++;
      }
    }

    const avgChange = count > 0 ? totalChange / count : 0;
    const sign = avgChange >= 0 ? "+" : "";
    return {
      name: sectorName,
      pct: `${sign}${avgChange.toFixed(2)}%`,
      rawPct: avgChange,
      up: avgChange >= 0
    };
  });

  // 2. Gainers & Losers (constituent stocks only)
  const stockQuotes = ALL_CONSTITUENTS.map(sym => quoteMap[sym]).filter(Boolean);
  
  const sortedGainers = [...stockQuotes]
    .filter(q => typeof q.percentChange === "number")
    .sort((a, b) => b.percentChange - a.percentChange);

  const sortedLosers = [...stockQuotes]
    .filter(q => typeof q.percentChange === "number")
    .sort((a, b) => a.percentChange - b.percentChange);

  const formatPrice = (p) => {
    if (p == null) return "0.00";
    return Number(p).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPercent = (c) => {
    if (c == null) return "0.00%";
    const sign = c >= 0 ? "+" : "";
    return `${sign}${c.toFixed(2)}%`;
  };

  const topGainers = sortedGainers.slice(0, 4).map(q => ({
    s: q.key,
    p: formatPrice(q.ltp),
    c: formatPercent(q.percentChange)
  }));

  const topLosers = sortedLosers.slice(0, 4).map(q => ({
    s: q.key,
    p: formatPrice(q.ltp),
    c: formatPercent(q.percentChange)
  }));

  // 3. Market Breadth (Advances / Declines)
  let advances = 0;
  let declines = 0;
  let unchanged = 0;

  for (const q of stockQuotes) {
    if (q && typeof q.percentChange === "number") {
      if (q.percentChange > 0) advances++;
      else if (q.percentChange < 0) declines++;
      else unchanged++;
    } else {
      unchanged++;
    }
  }

  const ratioVal = declines > 0 ? (advances / declines) : advances;
  const ratioStr = ratioVal.toFixed(2);

  // 4. Market Sentiment
  const niftyQuote = quoteMap["NIFTY"];
  const bankNiftyQuote = quoteMap["BANKNIFTY"];
  const niftyPct = niftyQuote && typeof niftyQuote.percentChange === "number" ? niftyQuote.percentChange : 0;
  const bnPct = bankNiftyQuote && typeof bankNiftyQuote.percentChange === "number" ? bankNiftyQuote.percentChange : 0;

  let sentimentScore = 50;
  sentimentScore += Math.max(-20, Math.min(20, niftyPct * 15));
  
  const totalBreadth = advances + declines;
  if (totalBreadth > 0) {
    const breadthRatio = (advances - declines) / totalBreadth;
    sentimentScore += breadthRatio * 20;
  }
  
  const positiveSectors = sectorPerformance.filter(s => s.up).length;
  const totalSectors = sectorPerformance.length;
  if (totalSectors > 0) {
    const sectorRatio = (positiveSectors / totalSectors) - 0.5;
    sentimentScore += sectorRatio * 20;
  }

  sentimentScore = Math.max(10, Math.min(90, sentimentScore));

  let sentimentValue = "Neutral";
  if (sentimentScore >= 60) sentimentValue = "Bullish";
  else if (sentimentScore <= 40) sentimentValue = "Bearish";

  const advDecText = `A/D ratio is ${ratioStr}:1 with ${advances} advances and ${declines} declines.`;
  const niftyText = `Nifty 50 is ${niftyPct >= 0 ? "up" : "down"} by ${Math.abs(niftyPct).toFixed(2)}%`;
  const bnText = `Bank Nifty is ${bnPct >= 0 ? "up" : "down"} by ${Math.abs(bnPct).toFixed(2)}%`;
  const sectorText = `${positiveSectors} out of ${totalSectors} major sectors are advancing.`;
  
  const explanation = `${sentimentValue} outlook driven by market action: ${niftyText}, ${bnText}. Breadth is active with ${advDecText} Sector participation is supportive with ${sectorText}`;

  return {
    sectors: sectorPerformance.map(s => ({ name: s.name, pct: s.pct, up: s.up })),
    gainers: topGainers,
    losers: topLosers,
    breadth: {
      advances,
      declines,
      unchanged,
      ratio: ratioStr
    },
    sentiment: {
      value: sentimentValue,
      score: Math.round(sentimentScore),
      explanation
    },
    updatedAt: new Date().toISOString()
  };
}

module.exports = { getDashboardData };
