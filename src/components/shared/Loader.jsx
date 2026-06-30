export function Loader({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-300">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
      <span>{label}</span>
    </div>
  );
}
