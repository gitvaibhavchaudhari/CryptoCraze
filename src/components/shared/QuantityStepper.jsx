import { Minus, Plus } from "lucide-react";
import { cn } from "../../utils/helpers";

export function QuantityStepper({
  className,
  inputClassName,
  min = 1,
  onChange,
  value
}) {
  const numericValue = Math.max(min, Number(value) || min);

  function update(nextValue) {
    onChange?.(Math.max(min, Number(nextValue) || min));
  }

  return (
    <div className={cn("inline-flex h-11 items-stretch rounded-lg border border-white/10 bg-white/5", className)}>
      <button
        aria-label="Decrease quantity"
        className="grid w-11 place-items-center text-slate-300 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={numericValue <= min}
        onClick={() => update(numericValue - 1)}
        title="Decrease quantity"
        type="button"
      >
        <Minus size={16} />
      </button>
      <input
        aria-label="Quantity"
        className={cn(
          "w-16 border-x border-white/10 bg-transparent px-2 text-center text-sm font-semibold text-white outline-none",
          inputClassName
        )}
        min={min}
        onChange={(event) => update(event.target.value)}
        type="number"
        value={numericValue}
      />
      <button
        aria-label="Increase quantity"
        className="grid w-11 place-items-center text-slate-300 transition hover:bg-white/8 hover:text-white"
        onClick={() => update(numericValue + 1)}
        title="Increase quantity"
        type="button"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
