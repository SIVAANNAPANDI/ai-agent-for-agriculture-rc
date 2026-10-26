import React from "react";
import { cn } from "../../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "primary";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "success",
  size = "md",
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full shrink-0 tracking-wide";

  const variants = {
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
    warning: "bg-amber-50 text-amber-800 border border-amber-200/80",
    danger: "bg-red-50 text-red-800 border border-red-200/80",
    info: "bg-blue-50 text-blue-800 border border-blue-200/80",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
    primary: "bg-agri-primary/10 text-agri-primary border border-agri-primary/20",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
