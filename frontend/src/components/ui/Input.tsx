import React from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-agri-text"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-xl border border-agri-border bg-white text-agri-text text-base placeholder:text-slate-400 transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-agri-primary focus:border-transparent",
              "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
              "h-12 px-4", // 48px touch height
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              error && "border-agri-danger focus:ring-agri-danger",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-slate-400 flex items-center">
              {rightIcon}
            </div>
          )}
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

Input.displayName = "Input";
