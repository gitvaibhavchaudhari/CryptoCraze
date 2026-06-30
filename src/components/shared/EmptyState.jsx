import { buttonStyles } from "./Button";

export function EmptyState({ title, description, actionLabel, actionHref }) {
  return (
    <div className="glass-panel rounded-lg p-8 text-center">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
      {actionHref && actionLabel ? (
        <a className={`${buttonStyles("primary")} mt-6`} href={actionHref}>
          {actionLabel}
        </a>
      ) : null}
    </div>
  );
}
