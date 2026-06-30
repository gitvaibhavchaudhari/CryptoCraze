import { useEffect, useMemo, useState } from "react";
import { PaymentModal } from "../components/payments/PaymentModal";
import { Button } from "../components/shared/Button";
import { Loader } from "../components/shared/Loader";
import { QuantityStepper } from "../components/shared/QuantityStepper";
import { SectionHeading } from "../components/shared/SectionHeading";
import { useAppData } from "../hooks/useAppData";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { fetchMarketCoins } from "../services/marketService";
import { formatCurrency, formatPercent } from "../utils/formatters";

export function BuyPage() {
  const { addToCart, recordPurchase, toggleWatchlist, userData } = useAppData();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [quantities, setQuantities] = useState({});
  const [paymentCoin, setPaymentCoin] = useState(null);
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    async function loadBuyMarket() {
      setLoading(true);
      setError("");

      try {
        setCoins(await fetchMarketCoins({ perPage: 24 }));
      } catch (fetchError) {
        setError(fetchError.message || "Unable to load buy page data.");
      } finally {
        setLoading(false);
      }
    }

    loadBuyMarket();
  }, []);

  const filteredCoins = useMemo(() => {
    return coins.filter(
      (coin) =>
        !debouncedQuery ||
        coin.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [coins, debouncedQuery]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Buy Crypto"
        title="Choose assets for your order"
        description="Search live markets, set quantity, and prepare your order from a focused buying screen."
        action={
          <input
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-cyan-300/60"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search coins"
            value={query}
          />
        }
      />

      {loading ? <Loader label="Loading buy page market data..." /> : null}
      {error ? <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

      {!loading && !error ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredCoins.map((coin) => {
            const quantity = quantities[coin.id] || 1;
            const positive = (coin.price_change_percentage_24h || 0) >= 0;
            const watched = userData?.watchlist?.includes(coin.id);

            return (
              <article key={coin.id} className="glass-panel rounded-lg p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img alt={coin.name} className="h-11 w-11 rounded-full" src={coin.image} />
                    <div>
                      <p className="font-medium text-white">{coin.name}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{coin.symbol}</p>
                    </div>
                  </div>
                  <button
                    className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                      watched ? "bg-cyan-300/15 text-cyan-200" : "bg-white/5 text-slate-300"
                    }`}
                    onClick={() => toggleWatchlist(coin.id)}
                    type="button"
                  >
                    {watched ? "Watching" : "Watch"}
                  </button>
                </div>

                <p className="mt-5 text-3xl font-semibold text-white">{formatCurrency(coin.current_price)}</p>
                <p className={`mt-2 text-sm ${positive ? "text-emerald-300" : "text-rose-300"}`}>
                  {formatPercent(coin.price_change_percentage_24h)}
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <QuantityStepper
                    onChange={(nextQuantity) =>
                      setQuantities((current) => ({
                        ...current,
                        [coin.id]: nextQuantity
                      }))
                    }
                    value={quantity}
                  />
                  <Button className="flex-1" onClick={() => setPaymentCoin(coin)}>
                    Pay Now
                  </Button>
                </div>
                <button
                  className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                  onClick={() => addToCart(coin, quantity)}
                  type="button"
                >
                  Add to Cart
                </button>
              </article>
            );
          })}
        </div>
      ) : null}

      <PaymentModal
        coin={paymentCoin}
        isOpen={Boolean(paymentCoin)}
        onClose={() => setPaymentCoin(null)}
        onSuccess={recordPurchase}
        quantity={paymentCoin ? quantities[paymentCoin.id] || 1 : 1}
      />
    </div>
  );
}
