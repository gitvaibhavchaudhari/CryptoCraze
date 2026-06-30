import { Link } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { buttonStyles } from "../components/shared/Button";

const legalContent = {
  "privacy-policy": {
    eyebrow: "Privacy Policy",
    title: "How CryptoCraze handles your data",
    updated: "Last updated: May 29, 2026",
    sections: [
      {
        title: "Information We Collect",
        body: "CryptoCraze stores account profile details, watchlist selections, cart items, portfolio entries, and transaction records needed to run the demo trading experience. Payment card, UPI, wallet, or banking credentials are handled by Razorpay checkout and are not stored in this app."
      },
      {
        title: "How We Use Information",
        body: "We use saved app data to keep your dashboard, portfolio, cart, and transaction history in sync across sessions. Market data is requested from third-party market APIs so prices and charts can be displayed inside the workspace."
      },
      {
        title: "Storage And Security",
        body: "When Firebase is configured, user state is stored in Firestore. In local demo mode, user state may be kept in browser local storage. Secrets such as Razorpay keys must stay on the server and should never be exposed in client-side code."
      },
      {
        title: "Your Choices",
        body: "You can remove items from your cart, update your watchlist, and sign out at any time. For a production deployment, provide account deletion, data export, and support contact workflows before accepting real users."
      }
    ]
  },
  terms: {
    eyebrow: "Terms & Conditions",
    title: "Rules for using CryptoCraze",
    updated: "Last updated: May 29, 2026",
    sections: [
      {
        title: "Demo And Educational Use",
        body: "CryptoCraze is a portfolio-style software project for exploring cryptocurrency market data, authentication, carts, payments, and portfolio tracking. It is not financial advice, an exchange, a broker, or a custody service."
      },
      {
        title: "Payments",
        body: "Payment checkout is integrated through Razorpay for order creation and verification. Do not process live customer payments until the deployment has production credentials, webhook validation, legal review, refunds, support, and compliance controls."
      },
      {
        title: "Market Data",
        body: "Prices, charts, and market metrics come from external providers and may be delayed, incomplete, or unavailable. Users should verify market information independently before making any real financial decision."
      },
      {
        title: "User Responsibilities",
        body: "Users are responsible for keeping account credentials safe, entering accurate payment details, and complying with applicable laws. Abuse, scraping, credential sharing, or attempts to bypass security controls are not permitted."
      }
    ]
  }
};

export function LegalPage({ type }) {
  const content = legalContent[type] || legalContent["privacy-policy"];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/85">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5 md:px-6">
          <Link className="flex items-center gap-3" to="/">
            <img alt="CryptoCraze" className="h-10 w-auto" src="/crypto-logo.png" />
            <span className="text-sm font-semibold">CryptoCraze</span>
          </Link>
          <Link className={buttonStyles("secondary")} to="/">
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 md:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">{content.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">{content.title}</h1>
        <p className="mt-3 text-sm text-slate-400">{content.updated}</p>

        <div className="mt-8 grid gap-4">
          {content.sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <p className="mt-3 leading-7 text-slate-300">{section.body}</p>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
