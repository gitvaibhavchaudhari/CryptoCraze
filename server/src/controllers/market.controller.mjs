import { env } from "../config/env.mjs";

function buildCoinGeckoHeaders() {
  const headers = { Accept: "application/json" };

  if (env.coinGeckoProApiKey) {
    headers["x-cg-pro-api-key"] = env.coinGeckoProApiKey;
  }

  if (env.coinGeckoDemoApiKey) {
    headers["x-cg-demo-api-key"] = env.coinGeckoDemoApiKey;
  }

  return headers;
}

export async function proxyCoinGecko(request, response) {
  const upstreamPath = request.originalUrl.replace("/api/coingecko", "");
  const upstreamUrl = `${env.coinGeckoApiBase}${upstreamPath}`;
  const upstreamResponse = await fetch(upstreamUrl, {
    headers: buildCoinGeckoHeaders()
  });
  const contentType = upstreamResponse.headers.get("content-type") || "application/json";
  const bodyText = await upstreamResponse.text();

  response.status(upstreamResponse.status).type(contentType).send(bodyText);
}
