const axios = require("axios");
const config = require("../config");

const SEARCH_URL = "https://query2.finance.yahoo.com/v1/finance/search";
const ALPHA_URL = "https://www.alphavantage.co/query";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function cleanSymbolKey(symbol) {
  return symbol.toUpperCase().replace(/\.(NS|BO|BSE)$/i, "");
}

function withNseSuffix(symbol) {
  const upper = symbol.toUpperCase();
  return upper.includes(".") ? upper : `${upper}.NS`;
}

function parseNumber(value) {
  if (value == null) return null;
  const parsed = Number(String(value).replace(/,/g, "").replace(/%$/, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

async function searchYahooSymbol(symbol) {
  try {
    const response = await axios.get(SEARCH_URL, {
      params: { q: symbol },
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      timeout: 10_000,
    });

    const quotes = response?.data?.quotes || [];
    if (!quotes.length) return null;

    const exactSymbol = quotes.find(
      (item) => item.symbol?.toUpperCase() === symbol.toUpperCase() || item.symbol?.toUpperCase() === `${symbol.toUpperCase()}.NS`
    );
    const nseSymbol = quotes.find((item) => item.exchDisp === "NSE");
    const item = exactSymbol || nseSymbol || quotes[0];
    if (!item) return null;

    return {
      symbol: item.symbol || symbol,
      companyName: item.longname || item.shortname || item.symbol || symbol,
      exchange: item.exchDisp || "NSE",
      sector: item.sector || null,
      industry: item.industry || null,
    };
  } catch (error) {
    return null;
  }
}

async function fetchAlphaVantageOverview(symbol) {
  if (!config.alphaVantageKey) return null;
  try {
    const response = await axios.get(ALPHA_URL, {
      params: {
        function: "OVERVIEW",
        symbol: withNseSuffix(symbol),
        apikey: config.alphaVantageKey,
      },
      timeout: 12_000,
    });

    const payload = response.data;
    if (!payload || payload.Note || payload["Error Message"] || Object.keys(payload).length === 0) {
      return null;
    }

    return {
      marketCap: parseNumber(payload.MarketCapitalization),
      pe: parseNumber(payload.PERatio),
      pb: parseNumber(payload.PriceToBookRatio),
      roe: parseNumber(payload.ReturnOnEquityTTM),
      roce: parseNumber(payload.ReturnOnAssetsTTM),
      debtToEquity: parseNumber(payload.DebtToEquity),
      companyName: payload.Name || null,
      sector: payload.Sector || null,
      industry: payload.Industry || null,
    };
  } catch (error) {
    return null;
  }
}

async function fetchAlphaVantageIncome(symbol) {
  if (!config.alphaVantageKey) return null;
  try {
    const response = await axios.get(ALPHA_URL, {
      params: {
        function: "INCOME_STATEMENT",
        symbol: withNseSuffix(symbol),
        apikey: config.alphaVantageKey,
      },
      timeout: 12_000,
    });

    const reports = response?.data?.annualReports || [];
    if (!Array.isArray(reports) || reports.length < 2) {
      return null;
    }

    const [current, prior] = reports;
    const revenueCurrent = parseNumber(current.totalRevenue);
    const revenuePrior = parseNumber(prior.totalRevenue);
    const profitCurrent = parseNumber(current.netIncome);
    const profitPrior = parseNumber(prior.netIncome);

    return {
      revenueGrowth:
        revenueCurrent != null && revenuePrior != null && revenuePrior !== 0
          ? Number(((revenueCurrent - revenuePrior) / revenuePrior) * 100)
          : null,
      profitGrowth:
        profitCurrent != null && profitPrior != null && profitPrior !== 0
          ? Number(((profitCurrent - profitPrior) / profitPrior) * 100)
          : null,
    };
  } catch (error) {
    return null;
  }
}

async function fetchAlphaVantageQuote(symbol) {
  if (!config.alphaVantageKey) return null;
  try {
    const response = await axios.get(ALPHA_URL, {
      params: {
        function: "GLOBAL_QUOTE",
        symbol: withNseSuffix(symbol),
        apikey: config.alphaVantageKey,
      },
      timeout: 12_000,
    });

    const data = response?.data?.["Global Quote"] || {};
    if (!Object.keys(data).length) return null;

    const ltp = parseNumber(data["05. price"]);
    const open = parseNumber(data["02. open"]);
    const high = parseNumber(data["03. high"]);
    const low = parseNumber(data["04. low"]);
    const volume = parseNumber(data["06. volume"]);
    const change = parseNumber(data["09. change"]);
    const percentChange = parseNumber(data["10. change percent"]);

    return {
      symbol: data["01. symbol"] || symbol,
      ltp,
      open,
      high,
      low,
      close: parseNumber(data["08. previous close"]),
      netChange: change,
      percentChange,
      volume,
      raw: data,
    };
  } catch (error) {
    return null;
  }
}

async function fetchStockDetails(symbol) {
  const baseSymbol = cleanSymbolKey(symbol);
  const result = {
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

  const [searchMeta, alphaOverview, alphaIncome, alphaQuote] = await Promise.all([
    searchYahooSymbol(baseSymbol),
    fetchAlphaVantageOverview(baseSymbol),
    fetchAlphaVantageIncome(baseSymbol),
    fetchAlphaVantageQuote(baseSymbol),
  ]);

  if (searchMeta) {
    result.companyName = searchMeta.companyName;
    result.symbol = searchMeta.symbol;
    result.exchange = searchMeta.exchange;
    result.sector = searchMeta.sector;
    result.industry = searchMeta.industry;
  }

  if (alphaQuote) {
    result.ltp = alphaQuote.ltp;
    result.open = alphaQuote.open;
    result.high = alphaQuote.high;
    result.low = alphaQuote.low;
    result.close = alphaQuote.close;
    result.netChange = alphaQuote.netChange;
    result.percentChange = alphaQuote.percentChange;
    result.volume = alphaQuote.volume;
    result.raw = alphaQuote.raw;
  }

  if (alphaOverview) {
    result.marketCap = alphaOverview.marketCap;
    result.pe = alphaOverview.pe;
    result.pb = alphaOverview.pb;
    result.roe = alphaOverview.roe;
    result.roce = alphaOverview.roce;
    result.debtToEquity = alphaOverview.debtToEquity;
    if (!result.companyName) result.companyName = alphaOverview.companyName;
    if (!result.sector) result.sector = alphaOverview.sector;
    if (!result.industry) result.industry = alphaOverview.industry;
  }

  if (alphaIncome) {
    result.revenueGrowth = alphaIncome.revenueGrowth;
    result.profitGrowth = alphaIncome.profitGrowth;
  }

  return result;
}

module.exports = { cleanSymbolKey, fetchStockDetails };
