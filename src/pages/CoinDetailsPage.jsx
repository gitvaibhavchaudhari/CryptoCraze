import { Clock3, ShoppingCart, Star, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PriceChart } from "../components/charts/PriceChart";
import { Loader } from "../components/shared/Loader";
import { Button } from "../components/shared/Button";
import { SectionHeading } from "../components/shared/SectionHeading";
import { StatCard } from "../components/shared/StatCard";
import { useAppData } from "../hooks/useAppData";
import { fetchCoinChart, fetchCoinDetails } from "../services/marketService";
import { formatCompactNumber, formatCurrency, formatPercent } from "../utils/formatters";

export function CoinDetailsPage() {
  const { coinId } = useParams();
  const { addToCart, toggleWatchlist, userData } = useAppData();
  const [details, setDetails] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartRange, setChartRange] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCoinData() {
      setLoading(true);
      setError("");

      try {
        const [detailResponse, chartResponse] = await Promise.all([
          fetchCoinDetails(coinId),
          fetchCoinChart(coinId, chartRange)
        ]);
        setDetails(detailResponse);
        setChartData(chartResponse);
      } catch (fetchError) {
        setError(fetchError.message || "Unable to load coin details.");
      } finally {
        setLoading(false);
      }
    }

    loadCoinData();
  }, [chartRange, coinId]);

  const cleanedDescription = useMemo(() => {
    const raw = details?.description?.en || "";
    return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 320);
  }, [details]);

  const isWatched = userData?.watchlist?.includes(coinId);
  const currentPrice = details?.market_data?.current_price?.usd || 0;
  const priceChange = details?.market_data?.price_change_percentage_24h || 0;

  if (loading) {
    return <Loader label="Loading coin detail page..." />;
  }

  if (error) {
    return <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-lg p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <img alt={details.name} className="h-16 w-16 rounded-full" src={details.image?.large} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                  Coin Detail
                </p>
                <h2 className="mt-2 text-3xl font-semibold">{details.name}</h2>
                <p className="mt-1 text-sm uppercase tracking-[0.18em] text-slate-500">{details.symbol}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => toggleWatchlist(coinId)} variant="secondary">
                <Star className="mr-2" size={16} />
                {isWatched ? "Watching" : "Watchlist"}
              </Button>
              <Button
                onClick={() =>
                  addToCart({
                    id: details.id,
                    name: details.name,
                    symbol: details.symbol,
                    image: details.image?.small,
                    current_price: currentPrice
                  })
                }
              >
                <ShoppingCart className="mr-2" size={16} />
                Add to Cart
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StatCard
              caption="Spot price in USD."
              icon={TrendingUp}
              label="Current Price"
              value={formatCurrency(currentPrice)}
            />
            <StatCard
              caption="24-hour market movement."
              icon={Clock3}
              label="24h Change"
              value={formatPercent(priceChange)}
            />
            <StatCard
              caption="Total market capitalization."
              icon={TrendingUp}
              label="Market Cap"
              value={formatCompactNumber(details.market_data?.market_cap?.usd)}
            />
          </div>

          <p className="mt-8 text-sm leading-8 text-slate-300">{cleanedDescription}</p>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-lg p-6">
            <SectionHeading
              eyebrow="Fundamentals"
              title="Important metrics"
              description="Useful numbers to discuss in a technical or product walkthrough."
            />
            <div className="mt-5 grid gap-3 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/4 px-4 py-3">
                <span>Circulating supply</span>
                <strong>{formatCompactNumber(details.market_data?.circulating_supply)}</strong>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/4 px-4 py-3">
                <span>ATH</span>
                <strong>{formatCurrency(details.market_data?.ath?.usd)}</strong>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/4 px-4 py-3">
                <span>ATL</span>
                <strong>{formatCurrency(details.market_data?.atl?.usd)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionHeading
        eyebrow="Interactive chart"
        title={`${details.name} price movement`}
        description="Switch chart windows to discuss how market timelines are modeled in the app."
        action={
          <div className="flex gap-2">
            {[7, 30].map((days) => (
              <button
                key={days}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  chartRange === days
                    ? "bg-blue-500 text-white"
                    : "border border-white/10 bg-white/4 text-slate-300"
                }`}
                onClick={() => setChartRange(days)}
                type="button"
              >
                {days}d
              </button>
            ))}
          </div>
        }
      />

      <PriceChart data={chartData} />
    </div>
  );
}
