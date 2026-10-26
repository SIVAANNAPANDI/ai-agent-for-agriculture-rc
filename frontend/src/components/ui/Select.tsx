import React from "react";
import { cn } from "../../utils/cn";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-agri-text"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full rounded-xl border border-agri-border bg-white text-agri-text text-base transition-colors duration-150 appearance-none",
              "focus:outline-none focus:ring-2 focus:ring-agri-primary focus:border-transparent",
              "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
              "h-12 pl-4 pr-10", // 48px touch height
              error && "border-agri-danger focus:ring-agri-danger",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} {opt.sublabel ? `(${opt.sublabel})` : ""}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
        {error ? (
          <p className="text-xs font-medium text-agri-danger">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-agri-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
