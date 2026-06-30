import { cn } from "../../utils/helpers";

const variants = {
  primary:
    "bg-[linear-gradient(135deg,#3618E6_0%,#8822D2_50%,#E127E5_100%)] text-white shadow-[0_18px_48px_rgba(225,39,229,0.25)] hover:shadow-[0_20px_58px_rgba(225,39,229,0.35)]",
  secondary:
    "border border-white/10 bg-white/5 text-white hover:border-cyan-300/40 hover:bg-cyan-400/10",
  ghost: "text-slate-200 hover:bg-white/6",
  danger:
    "border border-rose-500/30 bg-rose-500/12 text-rose-200 hover:bg-rose-500/20"
};

export function buttonStyles(variant = "primary") {
  return cn(
    "inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant]
  );
}

export function Button({
  children,
  className,
  type = "button",
  variant = "primary",
  ...props
}) {
  return (
    <button className={cn(buttonStyles(variant), className)} type={type} {...props}>
      {children}
    </button>
  );
}
