export function StatCard({ label, value, caption, icon: Icon }) {
  return (
    <article className="glass-panel rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
            {label}
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{value}</h3>
        </div>
        {Icon ? (
          <span className="rounded-lg border border-white/10 bg-white/5 p-3 text-cyan-300">
            <Icon size={20} />
          </span>
        ) : null}
      </div>
      {caption ? <p className="mt-3 text-sm text-slate-400">{caption}</p> : null}
    </article>
  );
}
