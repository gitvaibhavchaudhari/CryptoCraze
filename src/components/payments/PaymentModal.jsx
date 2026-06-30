import { AnimatePresence, motion } from "framer-motion";
import { Building2, CheckCircle2, CreditCard, Loader2, Smartphone, Wallet, X, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../shared/Button";
import { useAuth } from "../../hooks/useAuth";
import {
  createPaymentOrder,
  loadRazorpayCheckout,
  recordPaymentFailure,
  verifyPayment
} from "../../services/paymentService";
import { formatCurrency } from "../../utils/formatters";

const paymentMethods = [
  { id: "card", label: "Credit/Debit Card", icon: CreditCard },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "netbanking", label: "Net Banking", icon: Building2 },
  { id: "wallet", label: "Wallet", icon: Wallet }
];

export function PaymentModal({ coin, isOpen, onClose, onSuccess, quantity = 1 }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("card");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [activeTransactionId, setActiveTransactionId] = useState(null);

  const numericAmount = Number(amount);

  useEffect(() => {
    if (!isOpen || !coin?.current_price) {
      return;
    }

    setAmount(String(Math.max(1, Math.round(coin.current_price * quantity))));
  }, [coin, isOpen, quantity]);

  const estimatedQuantity = useMemo(() => {
    if (!coin?.current_price || !numericAmount) {
      return quantity;
    }

    return Number((numericAmount / coin.current_price).toFixed(8));
  }, [amount, coin?.current_price, quantity]);

  function resetAndClose() {
    setStatus("idle");
    setMessage("");
    setActiveTransactionId(null);
    onClose?.();
  }

  async function handlePayment() {
    if (!coin) {
      return;
    }

    if (!user?.uid && !user?.email) {
      setMessage("Sign in before starting a payment.");
      setStatus("failed");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setMessage("Enter a valid amount to continue.");
      setStatus("failed");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const scriptLoaded = await loadRazorpayCheckout();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay checkout.");
      }

      const orderPayload = {
        userId: user?.uid || user?.email,
        userEmail: user?.email,
        coinId: coin.id,
        coinName: coin.name,
        coinSymbol: coin.symbol,
        quantity: estimatedQuantity,
        fiatAmount: numericAmount,
        currency: "INR",
        paymentMethod: method
      };

      const orderResponse = await createPaymentOrder(orderPayload);
      setActiveTransactionId(orderResponse.transactionId);

      const checkout = new window.Razorpay({
        key: orderResponse.keyId,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: "CryptoCraze",
        description: `Buy ${coin.name}`,
        order_id: orderResponse.order.id,
        prefill: {
          name: user?.displayName || "",
          email: user?.email || ""
        },
        method: {
          card: method === "card",
          upi: method === "upi",
          netbanking: method === "netbanking",
          wallet: method === "wallet"
        },
        theme: {
          color: "#8822D2"
        },
        handler: async (paymentResponse) => {
          setStatus("loading");
          setMessage("Verifying payment securely...");

          try {
            const verification = await verifyPayment({
              ...paymentResponse,
              transactionId: orderResponse.transactionId
            });

            setStatus("success");
            setMessage("Payment verified. Your transaction is confirmed.");
            toast.success("Payment confirmed.");
            onSuccess?.({
              coin,
              quantity: verification.transaction?.quantity || estimatedQuantity,
              fiatAmount: verification.transaction?.fiatAmount || numericAmount,
              paymentMethod: verification.transaction?.paymentMethod || method,
              transaction: verification.transaction
            });
          } catch (error) {
            await recordPaymentFailure({
              transactionId: orderResponse.transactionId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              error: {
                code: "verification_failed",
                description: error.message
              }
            }).catch(() => {});
            setStatus("failed");
            setMessage(error.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: () => {
            if (activeTransactionId || orderResponse.transactionId) {
              recordPaymentFailure({
                transactionId: activeTransactionId || orderResponse.transactionId,
                razorpay_order_id: orderResponse.order.id,
                error: {
                  code: "checkout_dismissed",
                  description: "Razorpay checkout was closed before completion."
                }
              }).catch(() => {});
            }
            setStatus("failed");
            setMessage("Payment was closed before completion.");
          }
        }
      });

      checkout.on("payment.failed", async (failureResponse) => {
        await recordPaymentFailure({
          transactionId: orderResponse.transactionId,
          razorpay_order_id: failureResponse.error?.metadata?.order_id || orderResponse.order.id,
          error: failureResponse.error
        }).catch(() => {});
        setStatus("failed");
        setMessage(failureResponse.error?.description || "Payment failed. Please try again.");
      });

      checkout.open();
    } catch (error) {
      setStatus("failed");
      setMessage(error.message || "Payment failed. Please try again.");
    }
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/80 px-4 py-8 backdrop-blur-xl"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-2xl rounded-lg border border-white/10 bg-slate-950 p-5 shadow-2xl shadow-black/50 md:p-6"
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                  Secure Payment
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Buy {coin?.name || "crypto"}</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Complete your order with Razorpay-ready checkout.
                </p>
              </div>
              <button
                aria-label="Close payment modal"
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:text-white"
                onClick={resetAndClose}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  {coin?.image ? <img alt={coin.name} className="h-11 w-11 rounded-full" src={coin.image} /> : null}
                  <div>
                    <p className="font-semibold text-white">{coin?.name}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{coin?.symbol}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Live price</span>
                    <span className="text-white">{formatCurrency(coin?.current_price || 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated units</span>
                    <span className="text-white">{estimatedQuantity}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-200" htmlFor="payment-amount">
                    Amount (INR)
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                    id="payment-amount"
                    min="1"
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="5000"
                    type="number"
                    value={amount}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-200">Payment method</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {paymentMethods.map(({ icon: Icon, id, label }) => (
                      <button
                        key={id}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm transition ${
                          method === id
                            ? "border-cyan-300/60 bg-cyan-300/10 text-cyan-100"
                            : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20"
                        }`}
                        onClick={() => setMethod(id)}
                        type="button"
                      >
                        <Icon size={17} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {status !== "idle" && message ? (
              <div
                className={`mt-5 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
                  status === "success"
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                    : "border-rose-400/30 bg-rose-500/10 text-rose-200"
                }`}
              >
                {status === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <span>{message}</span>
              </div>
            ) : null}

            <Button className="mt-6 w-full" disabled={status === "loading"} onClick={handlePayment}>
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={17} />
                  Creating secure order...
                </>
              ) : (
                "Continue to Payment"
              )}
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
