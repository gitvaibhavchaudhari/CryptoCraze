import { Bell, LayoutDashboard, LogOut, Search, ShoppingCart, Star, User, WalletCards } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAppData } from "../../hooks/useAppData";
import { buttonStyles } from "../shared/Button";

const navItems = [
  { label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard },
  { label: "Buy Crypto", to: "/app/buy", icon: ShoppingCart },
  { label: "Portfolio", to: "/app/portfolio", icon: WalletCards },
  { label: "Watchlist", to: "/app/watchlist", icon: Star }
];

export function AppShell() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { summary } = useAppData();

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="relative h-screen overflow-hidden bg-slate-950 text-white">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(225,39,229,0.25),transparent_48%)]" />

      <div className="relative mx-auto flex h-screen w-full max-w-[1500px] flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-slate-950/75 px-4 py-5 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:w-[280px] lg:shrink-0 lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5">
          <div className="flex items-center justify-between gap-4 lg:block">
            <div>
              <img alt="CryptoCraze" className="h-11 w-auto" src="/crypto-logo.png" />
              <p className="mt-5 hidden text-sm leading-6 text-slate-400 lg:block">
                Professional crypto buying, wallet review, and market monitoring.
              </p>
            </div>
            <NavLink className={`${buttonStyles("secondary")} lg:hidden`} to="/app/cart">
              Cart ({summary.cartCount})
            </NavLink>
          </div>

          <nav className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1" aria-label="App navigation">
            {navItems.map(({ icon: Icon, label, to }) => (
              <NavLink
                key={to}
                className={({ isActive }) =>
                  `flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition lg:justify-start ${
                    isActive
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-300 hover:bg-white/6 hover:text-white"
                  }`
                }
                to={to}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-300/15 text-cyan-200">
                <User size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{user?.displayName || "CryptoCraze User"}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Cart</span>
                <span className="text-slate-200">{summary.cartCount} items</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Watchlist</span>
                <span className="text-slate-200">{summary.watchlistCount} coins</span>
              </div>
            </div>
            <button className={`${buttonStyles("danger")} mt-5 w-full`} onClick={handleLogout} type="button">
              <LogOut className="mr-2" size={16} />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col px-4 py-5 md:px-6 lg:px-8">
          <header className="glass-panel z-10 flex shrink-0 flex-wrap items-center justify-between gap-4 rounded-lg px-4 py-4 md:px-5">
            <div>
              <h1 className="text-xl font-semibold md:text-2xl">CryptoCraze Workspace</h1>
            </div>
            <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
              <div className="hidden min-w-[240px] items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 md:flex">
                <Search size={16} />
                <span>Search markets from dashboard</span>
              </div>
              <button
                aria-label="Notifications"
                className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:text-cyan-300"
                type="button"
              >
                <Bell size={18} />
              </button>
              <NavLink className={buttonStyles("secondary")} to="/app/cart">
                Cart ({summary.cartCount})
              </NavLink>
            </div>
          </header>

          <main className="scrollbar-thin mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
            <Outlet />

            <footer className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-white/10 py-5 text-center text-xs text-slate-500">
              <span>Copyright {new Date().getFullYear()} CryptoCraze by VC.</span>
              <Link className="transition hover:text-cyan-300" to="/privacy-policy">Privacy Policy</Link>
              <span aria-hidden="true">.</span>
              <Link className="transition hover:text-cyan-300" to="/terms">Terms & Conditions</Link>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
