import { Link } from "react-router-dom";
import { buttonStyles } from "../components/shared/Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel max-w-xl rounded-lg p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          The route you requested does not exist in the current CryptoCraze app.
        </p>
        <Link className={`${buttonStyles("primary")} mt-6`} to="/">
          Return Home
        </Link>
      </div>
    </div>
  );
}
