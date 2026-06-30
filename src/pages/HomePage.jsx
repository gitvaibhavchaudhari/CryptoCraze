import { ArrowRight, LogIn, ShieldCheck, Sparkles, UserPlus, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthModal } from "../components/auth/AuthModal";
import { Footer } from "../components/layout/Footer";
import { buttonStyles } from "../components/shared/Button";
import { useAuth } from "../hooks/useAuth";
import { fetchMarketCoins } from "../services/marketService";
import { formatCurrency, formatPercent } from "../utils/formatters";

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    async function loadHeroMarkets() {
      try {
        setCoins(await fetchMarketCoins({ perPage: 5 }));
      } catch (error) {
        setCoins([]);
      }
    }

    loadHeroMarkets();
  }, []);

  const featuredCoins = useMemo(() => coins.slice(0, 4), [coins]);

  function openAuth(mode) {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  function handleBuyCrypto() {
    if (isAuthenticated) {
      navigate("/app/buy");
      return;
    }

    openAuth("login");
  }

  function handleDashboard() {
    if (isAuthenticated) {
      navigate("/app/dashboard");
      return;
    }

    openAuth("login");
  }

  function handleGetStarted() {
    if (isAuthenticated) {
      navigate("/app/dashboard");
      return;
    }

    openAuth("signup");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <main className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#100D28_0%,#1A1446_45%,#1A1446_100%)]" />
        <div className="absolute inset-0 -z-10 bg-grid opacity-35" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-slate-950 to-transparent" />

        <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 md:px-6 lg:px-8">
          <Link className="flex items-center gap-3" to="/">
            <img alt="CryptoCraze" className="h-11 w-auto" src="/crypto-logo.png" />
            <span className="text-sm font-semibold tracking-wide text-white">CryptoCraze</span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            {isAuthenticated ? (
              <button className={buttonStyles("secondary")} onClick={handleDashboard} type="button">
                Dashboard
              </button>
            ) : (
              <>
                <button
                  className={`${buttonStyles("secondary")} border-white/15 bg-white/4 px-4`}
                  onClick={() => openAuth("login")}
                  type="button"
                >
                  <LogIn className="mr-2" size={16} />
                  Login
                </button>
                <button
                  className={`${buttonStyles("primary")} px-4 shadow-[0_12px_34px_rgba(225,39,229,0.24)]`}
                  onClick={() => openAuth("signup")}
                  type="button"
                >
                  <UserPlus className="mr-2" size={16} />
                  Signup
                </button>
              </>
            )}
          </nav>
        </header>

        <section className="mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl items-center gap-10 px-4 pb-16 pt-8 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              <Sparkles size={14} />
              Modern crypto buying platform
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight text-white md:text-7xl">
              CryptoCraze
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Buy, monitor, and manage digital assets from a focused fintech workspace built for secure onboarding and fast market decisions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className={buttonStyles("primary")} onClick={handleBuyCrypto} type="button">
                Buy Crypto <ArrowRight className="ml-2" size={17} />
              </button>
              <button className={buttonStyles("secondary")} onClick={handleGetStarted} type="button">
                Start Trading
              </button>
              <button className={buttonStyles("ghost")} onClick={handleGetStarted} type="button">
                Get Started
              </button>
            </div>
            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, label: "Secure auth" },
                { icon: WalletCards, label: "Wallet view" },
                { icon: Sparkles, label: "Live markets" }
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <Icon className="text-cyan-300" size={18} />
                  <span className="text-sm font-medium text-slate-200">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-lg p-4 md:p-5">
            <div className="rounded-lg border border-white/10 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    Market Overview
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Popular assets</h2>
                </div>
                <span className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Live
                </span>
              </div>

              <div className="mt-6 grid gap-3">
                {featuredCoins.length ? (
                  featuredCoins.map((coin) => {
                    const positive = (coin.price_change_percentage_24h || 0) >= 0;
                    return (
                      <div
                        key={coin.id}
                        className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-4 transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <img alt={coin.name} className="h-10 w-10 rounded-full" src={coin.image} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">{coin.name}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{coin.symbol}</p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-medium text-white">{formatCurrency(coin.current_price)}</p>
                          <p className={`text-sm ${positive ? "text-emerald-300" : "text-rose-300"}`}>
                            {formatPercent(coin.price_change_percentage_24h)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                    Market data will appear when the live feed is available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <AuthModal initialMode={authMode} isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
