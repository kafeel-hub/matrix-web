import { type SelectHTMLAttributes } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function SelectField({ label, className = "", id, name, children, ...props }: SelectFieldProps) {
  const inputId = id ?? name;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-ink-700/70">
          {label}
        </label>
      )}
      <select
        id={inputId}
        name={name}
        className={`rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm text-ink-900 focus-visible:border-brass-500 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
