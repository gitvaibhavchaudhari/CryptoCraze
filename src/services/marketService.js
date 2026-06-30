import { formatChartDate } from "../utils/formatters";

const API_BASE = import.meta.env.VITE_COINGECKO_API_BASE || "https://api.coingecko.com/api/v3";

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error("Unable to fetch crypto market data right now.");
  }

  return response.json();
}

export async function fetchMarketCoins({
  page = 1,
  perPage = 50,
  currency = "usd",
  ids = ""
} = {}) {
  const params = new URLSearchParams({
    vs_currency: currency,
    order: "market_cap_desc",
    per_page: String(perPage),
    page: String(page),
    sparkline: "false",
    price_change_percentage: "24h"
  });

  if (ids) {
    params.set("ids", ids);
  }

  return request(`/coins/markets?${params.toString()}`);
}

export async function fetchCoinDetails(coinId) {
  return request(
    `/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
  );
}

export async function fetchCoinChart(coinId, days = 7) {
  const result = await request(
    `/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? "hourly" : "daily"}`
  );

  return result.prices.map(([timestamp, price]) => ({
    timestamp,
    price: Number(price.toFixed(2)),
    label: formatChartDate(timestamp, days)
  }));
}
