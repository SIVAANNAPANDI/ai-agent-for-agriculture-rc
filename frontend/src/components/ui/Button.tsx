import React from "react";
import { cn } from "../../utils/cn";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "touch";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-agri-primary text-white hover:bg-agri-primaryDark focus:ring-agri-primary shadow-sm hover:shadow",
      secondary:
        "bg-agri-primaryLight/15 text-agri-primary hover:bg-agri-primaryLight/25 focus:ring-agri-primaryLight",
      outline:
        "border border-agri-border bg-white text-agri-text hover:bg-agri-bg hover:border-slate-300 focus:ring-agri-primary shadow-sm",
      ghost:
        "text-agri-text hover:bg-slate-100 focus:ring-slate-300",
      danger:
        "bg-agri-danger text-white hover:bg-red-700 focus:ring-agri-danger shadow-sm",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs font-semibold gap-1.5 h-8",
      md: "px-4 py-2.5 text-sm gap-2 h-10",
      lg: "px-6 py-3 text-base gap-2.5 h-12",
      touch: "px-5 py-3 text-base font-semibold gap-2.5 min-h-[48px] w-full sm:w-auto", // 48px touch target for farmers
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
