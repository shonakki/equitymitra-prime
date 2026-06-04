const axios = require("axios");

let ipoCache = {
  data: null,
  timestamp: 0
};
const IPO_CACHE_TTL = 60 * 60 * 1000; // 60 minutes

async function getIpoCalendar() {
  const now = Date.now();
  if (ipoCache.data && (now - ipoCache.timestamp < IPO_CACHE_TTL)) {
    return ipoCache.data;
  }

  try {
    const res = await axios.get("https://finapi.upvaly.com/api/ipo", { timeout: 10000 });
    if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
      const formatted = res.data.data.map(item => {
        const openDate = item.schedule?.startDate || "N/A";
        const closeDate = item.schedule?.endDate || "N/A";
        const totalSize = item.issueSize?.totalIssueSize;
        const issueSize = totalSize ? `₹${totalSize} Cr` : "N/A";
        
        return {
          name: item.name || "Unknown Company",
          openDate,
          closeDate,
          issueSize,
          priceBand: item.priceRange || "N/A",
          lotSize: item.lotSize || "N/A",
          status: item.status || "N/A"
        };
      });
      ipoCache = {
        data: formatted,
        timestamp: now
      };
      return formatted;
    }
    throw new Error("Invalid response format");
  } catch (err) {
    console.error("[nseApi] Upvaly IPO fetch failed:", err.message);
    // If the cache is expired but we have old data, we can fall back to it
    // otherwise return null so the frontend shows "IPO Data Unavailable"
    return ipoCache.data || null;
  }
}

module.exports = { getIpoCalendar };
