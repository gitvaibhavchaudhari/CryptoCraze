import { Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCompactNumber, formatCurrency, formatPercent } from "../../utils/formatters";

export function MarketTable({
  coins,
  watchlist = [],
  onToggleWatchlist,
  onAddToCart,
  detailBasePath = "/app/markets"
}) {
  return (
    <div className="glass-panel scrollbar-thin overflow-x-auto rounded-lg">
      <table className="min-w-full divide-y divide-white/8 text-left">
        <thead className="text-xs uppercase tracking-[0.2em] text-slate-500">
          <tr>
            <th className="px-5 py-4">Coin</th>
            <th className="px-5 py-4">Price</th>
            <th className="px-5 py-4">24h Change</th>
            <th className="px-5 py-4">Market Cap</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/6 text-sm text-slate-300">
          {coins.map((coin) => {
            const positive = (coin.price_change_percentage_24h || 0) >= 0;
            const isWatched = watchlist.includes(coin.id);

            return (
              <tr key={coin.id} className="hover:bg-white/4">
                <td className="px-5 py-4">
                  <Link className="flex items-center gap-3" to={`${detailBasePath}/${coin.id}`}>
                    <img alt={coin.name} className="h-10 w-10 rounded-full" src={coin.image} />
                    <div>
                      <p className="font-medium text-white">{coin.name}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {coin.symbol}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-4 font-medium text-white">{formatCurrency(coin.current_price)}</td>
                <td className={`px-5 py-4 font-medium ${positive ? "text-emerald-300" : "text-rose-300"}`}>
                  {formatPercent(coin.price_change_percentage_24h)}
                </td>
                <td className="px-5 py-4">{formatCompactNumber(coin.market_cap)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      className={`rounded-lg border px-3 py-2 transition ${
                        isWatched
                          ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-200"
                          : "border-white/8 bg-white/4 text-slate-200"
                      }`}
                      onClick={() => onToggleWatchlist?.(coin.id)}
                      type="button"
                    >
                      <Star className="inline-block" size={16} />
                    </button>
                    <button
                      className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                      onClick={() => onAddToCart?.(coin, 1)}
                      type="button"
                    >
                      <Plus className="inline-block" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
