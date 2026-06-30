import { BarChart3, CreditCard, DollarSign, Layers3, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MarketTable } from "../components/dashboard/MarketTable";
import { PaymentModal } from "../components/payments/PaymentModal";
import { Button } from "../components/shared/Button";
import { Loader } from "../components/shared/Loader";
import { QuantityStepper } from "../components/shared/QuantityStepper";
import { SectionHeading } from "../components/shared/SectionHeading";
import { StatCard } from "../components/shared/StatCard";
import { useAppData } from "../hooks/useAppData";
import { useAuth } from "../hooks/useAuth";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { fetchMarketCoins } from "../services/marketService";
import { formatCompactNumber, formatCurrency, formatPercent } from "../utils/formatters";

export function DashboardPage() {
  const { user } = useAuth();
  const { addToCart, recordPurchase, summary, toggleWatchlist, userData } = useAppData();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedCoinId, setSelectedCoinId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentCoin, setPaymentCoin] = useState(null);
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    async function loadMarkets() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchMarketCoins({ perPage: 32 });
        setCoins(result);
        setSelectedCoinId(result[0]?.id || "");
      } catch (fetchError) {
        setError(fetchError.message || "Unable to fetch market data.");
      } finally {
        setLoading(false);
      }
    }

    loadMarkets();
  }, []);

  const livePortfolioValue = useMemo(() => {
    if (!userData?.portfolio?.length) {
      return summary.currentValue;
    }

    const marketMap = Object.fromEntries(coins.map((coin) => [coin.id, coin]));
    return userData.portfolio.reduce((sum, asset) => {
      const livePrice = marketMap[asset.coinId]?.current_price || asset.currentPrice || asset.averageBuyPrice;
      return sum + (livePrice * asset.quantity);
    }, 0);
  }, [coins, summary.currentValue, userData?.portfolio]);

  const filteredCoins = useMemo(() => {
    return coins.filter((coin) => {
      const matchesQuery =
        !debouncedQuery ||
        coin.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(debouncedQuery.toLowerCase());

      if (!matchesQuery) {
        return false;
      }

      if (filter === "gainers") {
        return (coin.price_change_percentage_24h || 0) >= 0;
      }

      if (filter === "losers") {
        return (coin.price_change_percentage_24h || 0) < 0;
      }

      return true;
    });
  }, [coins, debouncedQuery, filter]);

  const selectedCoin = coins.find((coin) => coin.id === selectedCoinId);
  const marketHighlights = coins.slice(0, 3);
  const recentTransactions = [...(userData?.transactions || [])]
    .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="glass-panel rounded-lg p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                Wallet Balance
              </p>
              <h2 className="mt-3 text-4xl font-semibold text-white md:text-5xl">
                {formatCurrency(livePortfolioValue)}
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                Signed in as {user?.displayName || user?.email || "CryptoCraze user"}
              </p>
            </div>
            <Link className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15" to="/app/portfolio">
              View Portfolio
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              caption="Total value committed through completed purchases."
              icon={DollarSign}
              label="Invested"
              value={formatCurrency(summary.totalInvestment)}
            />
            <StatCard
              caption="Current balance minus invested amount."
              icon={TrendingUp}
              label="Net P/L"
              value={formatCurrency(livePortfolioValue - summary.totalInvestment)}
            />
            <StatCard
              caption="Assets currently waiting for checkout."
              icon={Layers3}
              label="Cart"
              value={summary.cartCount}
            />
            <StatCard
              caption="Confirmed crypto purchase records."
              icon={BarChart3}
              label="Transactions"
              value={summary.transactionCount}
            />
          </div>
        </div>

        <div className="glass-panel rounded-lg p-5 md:p-6">
          <SectionHeading
            eyebrow="Buy Crypto"
            title="Quick order"
            description="Choose a live asset and add it to your cart."
          />
          <div className="mt-5 space-y-4">
            <select
              className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
              onChange={(event) => setSelectedCoinId(event.target.value)}
              value={selectedCoinId}
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.symbol.toUpperCase()})
                </option>
              ))}
            </select>
            <QuantityStepper
              className="w-full bg-slate-950/70"
              inputClassName="flex-1"
              onChange={setQuantity}
              value={quantity}
            />
            {selectedCoin ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                Estimated value: {formatCurrency(selectedCoin.current_price * quantity)}
              </div>
            ) : null}
            <Button className="w-full" disabled={!selectedCoin} onClick={() => setPaymentCoin(selectedCoin)}>
              Pay Now
            </Button>
            <button
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
              disabled={!selectedCoin}
              onClick={() => selectedCoin && addToCart(selectedCoin, quantity)}
              type="button"
            >
              Add to Cart Instead
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {marketHighlights.map((coin) => {
          const positive = (coin.price_change_percentage_24h || 0) >= 0;
          return (
            <article key={coin.id} className="glass-panel rounded-lg p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <img alt={coin.name} className="h-11 w-11 rounded-full" src={coin.image} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{coin.name}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{coin.symbol}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${positive ? "text-emerald-300" : "text-rose-300"}`}>
                  {formatPercent(coin.price_change_percentage_24h)}
                </span>
              </div>
              <p className="mt-5 text-3xl font-semibold">{formatCurrency(coin.current_price)}</p>
              <p className="mt-2 text-sm text-slate-400">Market cap {formatCompactNumber(coin.market_cap)}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.78fr]">
        <div>
          <SectionHeading
            eyebrow="Markets"
            title="Live market overview"
            description="Search and filter tradable assets from the latest market feed."
            action={
              <div className="flex flex-wrap gap-2">
                <input
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-cyan-300/60"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search BTC, ETH..."
                  value={query}
                />
                <select
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-cyan-300/60"
                  onChange={(event) => setFilter(event.target.value)}
                  value={filter}
                >
                  <option value="all">All coins</option>
                  <option value="gainers">Gainers</option>
                  <option value="losers">Losers</option>
                </select>
              </div>
            }
          />

          <div className="mt-5">
            {loading ? <Loader label="Loading dashboard market data..." /> : null}
            {error ? (
              <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            ) : null}
            {!loading && !error ? (
              <MarketTable
                coins={filteredCoins}
                onAddToCart={addToCart}
                onToggleWatchlist={toggleWatchlist}
                watchlist={userData?.watchlist || []}
              />
            ) : null}
          </div>
        </div>

        <aside className="glass-panel h-fit rounded-lg p-5">
          <SectionHeading
            eyebrow="Recent Transactions"
            title="Activity"
            description="Completed purchases appear here after checkout."
          />
          <div className="mt-5 grid gap-3">
            {recentTransactions.length ? (
              recentTransactions.map((asset) => (
                <div key={asset.coinId} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img alt={asset.name} className="h-9 w-9 rounded-full" src={asset.image} />
                    <div>
                      <p className="font-medium text-white">{asset.name}</p>
                      <p className="text-xs text-slate-500">Buy · {asset.quantity} {asset.symbol.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-white">{formatCurrency(asset.fiatAmount)}</p>
                    <p className="text-slate-500">{asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : "Pending"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                No completed purchases yet.
              </div>
            )}
          </div>

          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-blue-500/15 p-3 text-blue-200">
                <CreditCard size={20} />
              </span>
              <div>
                <p className="font-semibold text-white">Funding method</p>
                <p className="text-sm text-slate-400">Connect payment provider in production.</p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <PaymentModal
        coin={paymentCoin}
        isOpen={Boolean(paymentCoin)}
        onClose={() => setPaymentCoin(null)}
        onSuccess={recordPurchase}
        quantity={quantity}
      />
    </div>
  );
}
