import { type InputHTMLAttributes } from "react";

interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}

/**
 * Wraps a plain number input rather than react-hook-form/similar so the
 * caller stays in full control of the numeric value (important here since
 * line-item amounts feed straight into running totals on every keystroke).
 */
export function NumberField({
  label,
  value,
  onChange,
  suffix,
  className = "",
  id,
  name,
  ...props
}: NumberFieldProps) {
  const inputId = id ?? name;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-ink-700/70">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(e.target.valueAsNumber || 0)}
          onFocus={(e) => e.target.select()}
          className={`tabular w-full rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-right text-sm text-ink-900 focus-visible:border-brass-500 ${
            suffix ? "pr-8" : ""
          } ${className}`}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-ink-700/40">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
