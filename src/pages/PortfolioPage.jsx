import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/shared/EmptyState";
import { Loader } from "../components/shared/Loader";
import { SectionHeading } from "../components/shared/SectionHeading";
import { StatCard } from "../components/shared/StatCard";
import { useAppData } from "../hooks/useAppData";
import { fetchMarketCoins } from "../services/marketService";
import { formatCurrency, formatPercent } from "../utils/formatters";

export function PortfolioPage() {
  const { summary, userData } = useAppData();
  const [marketMap, setMarketMap] = useState({});
  const [loading, setLoading] = useState(false);

  const portfolio = userData?.portfolio || [];

  useEffect(() => {
    async function loadPortfolioPricing() {
      if (!portfolio.length) {
        setMarketMap({});
        return;
      }

      setLoading(true);

      try {
        const pricing = await fetchMarketCoins({
          ids: portfolio.map((item) => item.coinId).join(","),
          perPage: portfolio.length
        });
        setMarketMap(Object.fromEntries(pricing.map((coin) => [coin.id, coin])));
      } catch (error) {
        setMarketMap({});
      } finally {
        setLoading(false);
      }
    }

    loadPortfolioPricing();
  }, [portfolio]);

  const portfolioMetrics = useMemo(() => {
    const currentValue = portfolio.reduce((sum, asset) => {
      const currentPrice = marketMap[asset.coinId]?.current_price || asset.currentPrice || asset.averageBuyPrice;
      return sum + (currentPrice * asset.quantity);
    }, 0);

    const investment = portfolio.reduce((sum, asset) => sum + asset.investedAmount, 0);
    return {
      currentValue,
      investment,
      profitLoss: currentValue - investment
    };
  }, [marketMap, portfolio]);

  if (!portfolio.length) {
    return (
      <EmptyState
        actionHref="/app/buy"
        actionLabel="Buy Crypto"
        description="Checkout from the cart to create holdings and unlock live portfolio analytics."
        title="No portfolio holdings yet"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Investment" value={formatCurrency(portfolioMetrics.investment)} />
        <StatCard label="Current Value" value={formatCurrency(portfolioMetrics.currentValue)} />
        <StatCard label="Profit / Loss" value={formatCurrency(portfolioMetrics.profitLoss)} />
      </div>

      <SectionHeading
        eyebrow="Portfolio analytics"
        title="Track live performance of purchased assets"
        description="Each position stores your average buy price so profit/loss updates dynamically when market data refreshes."
      />

      {loading ? <Loader label="Refreshing portfolio values..." /> : null}

      <div className="glass-panel scrollbar-thin overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-white/8 text-left">
          <thead className="text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Asset</th>
              <th className="px-5 py-4">Quantity</th>
              <th className="px-5 py-4">Avg Buy Price</th>
              <th className="px-5 py-4">Current Price</th>
              <th className="px-5 py-4">P/L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6 text-sm text-slate-300">
            {portfolio.map((asset) => {
              const livePrice = marketMap[asset.coinId]?.current_price || asset.currentPrice || asset.averageBuyPrice;
              const pnl = (livePrice - asset.averageBuyPrice) * asset.quantity;
              const pnlPercent = asset.averageBuyPrice
                ? ((livePrice - asset.averageBuyPrice) / asset.averageBuyPrice) * 100
                : 0;

              return (
                <tr key={asset.coinId} className="hover:bg-white/4">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img alt={asset.name} className="h-10 w-10 rounded-full" src={asset.image} />
                      <div>
                        <p className="font-medium text-white">{asset.name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{asset.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{asset.quantity}</td>
                  <td className="px-5 py-4">{formatCurrency(asset.averageBuyPrice)}</td>
                  <td className="px-5 py-4">{formatCurrency(livePrice)}</td>
                  <td className={`px-5 py-4 ${pnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                    {formatCurrency(pnl)} ({formatPercent(pnlPercent)})
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-white/8 bg-white/4 px-5 py-4 text-sm text-slate-400">
        Stored value: {formatCurrency(summary.currentValue)}. Live calculations refresh this view with the latest market feed.
      </div>
    </div>
  );
}
