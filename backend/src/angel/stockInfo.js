const { fetchQuote, TOKENS } = require("./market");

function cleanSymbolKey(symbol) {
  return symbol.toUpperCase().replace(/\.(NS|BO|BSE)$/i, "");
}

async function fetchStockDetails(symbol) {
  const baseSymbol = cleanSymbolKey(symbol);
  
  // First try to fetch from Angel One API using token mapping
  if (TOKENS[baseSymbol]) {
    const result = await fetchQuote([baseSymbol]);
    if (result.data && result.data[0]) {
      return result.data[0];
    }
  }
  
  // If symbol not mapped or no data, return structure with nulls
  return {
    key: baseSymbol,
    symbol: baseSymbol,
    exchange: "NSE",
    token: null,
    ltp: null,
    open: null,
    high: null,
    low: null,
    close: null,
    netChange: null,
    percentChange: null,
    volume: null,
    raw: null,
    companyName: null,
    sector: null,
    industry: null,
    marketCap: null,
    pe: null,
    pb: null,
    roe: null,
    roce: null,
    debtToEquity: null,
    revenueGrowth: null,
    profitGrowth: null,
  };
}

module.exports = { cleanSymbolKey, fetchStockDetails };
