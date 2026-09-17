import { forwardRef, type InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`rounded-md border border-ink-700/20 bg-parchment-50 px-3 py-2 text-ink-900 placeholder:text-ink-600/50 focus-visible:border-brass-500 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-[#b3432f]">
            {error}
          </p>
        )}
      </div>
    );
  },
);
TextField.displayName = "TextField";
