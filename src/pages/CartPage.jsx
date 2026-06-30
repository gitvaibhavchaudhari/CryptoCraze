import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/shared/EmptyState";
import { Loader } from "../components/shared/Loader";
import { SectionHeading } from "../components/shared/SectionHeading";
import { Button } from "../components/shared/Button";
import { QuantityStepper } from "../components/shared/QuantityStepper";
import { useAppData } from "../hooks/useAppData";
import { fetchMarketCoins } from "../services/marketService";
import { formatCurrency } from "../utils/formatters";

export function CartPage() {
  const { checkout, removeFromCart, updateCartQuantity, userData } = useAppData();
  const [marketMap, setMarketMap] = useState({});
  const [loading, setLoading] = useState(false);

  const cart = userData?.cart || [];

  useEffect(() => {
    async function loadCartPricing() {
      if (!cart.length) {
        setMarketMap({});
        return;
      }

      setLoading(true);

      try {
        const pricing = await fetchMarketCoins({
          ids: cart.map((item) => item.coinId).join(","),
          perPage: cart.length
        });
        setMarketMap(Object.fromEntries(pricing.map((coin) => [coin.id, coin])));
      } catch (error) {
        setMarketMap({});
      } finally {
        setLoading(false);
      }
    }

    loadCartPricing();
  }, [cart]);

  const total = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const livePrice = marketMap[item.coinId]?.current_price || item.currentPrice;
        return sum + (livePrice * item.quantity);
      }, 0),
    [cart, marketMap]
  );

  if (!cart.length) {
    return (
      <EmptyState
        actionHref="/app/buy"
        actionLabel="Go to Buy Page"
        description="Add assets to your cart and then simulate a purchase into your portfolio."
        title="Your cart is empty"
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Cart management"
        title="Review and update your selected cryptocurrencies"
        description="Confirm quantities, review live pricing, and prepare your purchase."
      />

      {loading ? <Loader label="Refreshing cart valuations..." /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-4">
          {cart.map((item) => {
            const livePrice = marketMap[item.coinId]?.current_price || item.currentPrice;
            const subtotal = livePrice * item.quantity;

            return (
              <article key={item.coinId} className="glass-panel rounded-lg p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img alt={item.name} className="h-12 w-12 rounded-full" src={item.image} />
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.symbol}</p>
                    </div>
                  </div>
                  <button
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
                    onClick={() => removeFromCart(item.coinId)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Live price</p>
                    <p className="mt-2 text-lg font-medium text-white">{formatCurrency(livePrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Quantity</p>
                    <QuantityStepper
                      className="mt-2"
                      onChange={(nextQuantity) => updateCartQuantity(item.coinId, nextQuantity)}
                      value={item.quantity}
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Subtotal</p>
                    <p className="mt-2 text-lg font-medium text-white">{formatCurrency(subtotal)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="glass-panel h-fit rounded-lg p-6">
          <SectionHeading
            eyebrow="Checkout"
            title="Order summary"
            description="Checkout moves cart items into the portfolio with average buy price tracking."
          />
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/4 px-4 py-3">
              <span>Total assets</span>
              <strong>{cart.length}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/4 px-4 py-3">
              <span>Total units</span>
              <strong>{cart.reduce((sum, item) => sum + item.quantity, 0)}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/4 px-4 py-3">
              <span>Estimated value</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>
          <Button className="mt-6 w-full" onClick={() => checkout(marketMap)}>
            Checkout
          </Button>
        </aside>
      </div>
    </div>
  );
}
