import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/shared/EmptyState";
import { Loader } from "../components/shared/Loader";
import { SectionHeading } from "../components/shared/SectionHeading";
import { Button } from "../components/shared/Button";
import { useAppData } from "../hooks/useAppData";
import { fetchMarketCoins } from "../services/marketService";
import { formatCurrency, formatPercent } from "../utils/formatters";

export function WatchlistPage() {
  const { addToCart, toggleWatchlist, userData } = useAppData();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const watchlist = useMemo(() => userData?.watchlist || [], [userData?.watchlist]);
  const watchlistIds = watchlist.join(",");

  useEffect(() => {
    async function loadWatchlist() {
      if (!watchlistIds) {
        setCoins([]);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await fetchMarketCoins({
          ids: watchlistIds,
          perPage: watchlist.length
        });
        const marketMap = new Map(result.map((coin) => [coin.id, coin]));
        setCoins(watchlist.map((coinId) => marketMap.get(coinId)).filter(Boolean));
      } catch (error) {
        setCoins([]);
        setError(error.message || "Unable to refresh your watchlist right now.");
      } finally {
        setLoading(false);
      }
    }

    loadWatchlist();
  }, [watchlist, watchlistIds]);

  if (!watchlist.length) {
    return (
      <EmptyState
        actionHref="/app/dashboard"
        actionLabel="Open Dashboard"
        description="Star coins from the dashboard or detail page to keep a close eye on them here."
        title="Your watchlist is empty"
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Watchlist"
        title="Monitor shortlisted assets"
        description="Watchlist items use the same live market feed as the rest of the application."
      />

      {loading ? <Loader label="Refreshing watchlist..." /> : null}

      {error ? (
        <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      {!loading && !error && !coins.length ? (
        <EmptyState
          actionHref="/app/dashboard"
          actionLabel="Open Dashboard"
          description="The saved assets could not be matched with the current market feed. Add a coin again from the dashboard."
          title="No watchlist prices found"
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {coins.map((coin) => {
          const positive = (coin.price_change_percentage_24h || 0) >= 0;

          return (
            <article key={coin.id} className="glass-panel rounded-lg p-5">
              <div className="flex items-center gap-3">
                <img alt={coin.name} className="h-12 w-12 rounded-full" src={coin.image} />
                <div>
                  <p className="font-medium text-white">{coin.name}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{coin.symbol}</p>
                </div>
              </div>
              <p className="mt-5 text-3xl font-semibold text-white">{formatCurrency(coin.current_price)}</p>
              <p className={`mt-2 text-sm ${positive ? "text-emerald-300" : "text-rose-300"}`}>
                {formatPercent(coin.price_change_percentage_24h)}
              </p>
              <div className="mt-5 flex gap-2">
                <Button className="flex-1" onClick={() => addToCart(coin, 1)}>
                  Add to Cart
                </Button>
                <button
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-white"
                  onClick={() => toggleWatchlist(coin.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
              <Link
                className="mt-3 block rounded-lg border border-white/8 px-4 py-2.5 text-center text-sm font-medium text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white"
                to={`/app/markets/${coin.id}`}
              >
                Open Details
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
