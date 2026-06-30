import { Github, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  { label: "Buy Crypto", to: "/app/buy" },
  { label: "Dashboard", to: "/app/dashboard" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms" }
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <div>
          <Link className="inline-flex items-center gap-3" to="/">
            <img alt="CryptoCraze" className="h-10 w-auto" src="/crypto-logo.png" />
            <span className="text-sm font-semibold text-white">CryptoCraze by VC</span>
          </Link>
          <p className="mt-3 max-w-md text-sm text-slate-400">
            A clean crypto buying workspace for secure onboarding, market review, and portfolio action.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-300" aria-label="Footer links">
          {quickLinks.map((link) => (
            <Link key={link.label} className="transition hover:text-cyan-300" to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {[
            { label: "Twitter", icon: Twitter },
            { label: "LinkedIn", icon: Linkedin },
            { label: "GitHub", icon: Github }
          ].map(({ icon: Icon, label }) => (
            <a
              key={label}
              aria-label={label}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-300"
              href="#"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">
        Copyright {new Date().getFullYear()} CryptoCraze by VC. All rights reserved.
      </p>
    </footer>
  );
}
