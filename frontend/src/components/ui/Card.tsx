import React from "react";
import { cn } from "../../utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "hero" | "panel" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "surface",
      padding = "md",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "rounded-2xl transition-all duration-200";

    const variants = {
      surface:
        "bg-agri-surface border border-agri-border shadow-card hover:shadow-card-hover",
      hero:
        "bg-gradient-to-br from-agri-primary via-emerald-800 to-agri-primaryDark text-white shadow-hero border border-emerald-900/30",
      panel:
        "bg-agri-surface border border-agri-border/80 shadow-sm",
      interactive:
        "bg-agri-surface border border-agri-border shadow-card hover:shadow-card-hover hover:border-agri-primaryLight/40 cursor-pointer active:scale-[0.99]",
    };

    const paddings = {
      none: "p-0",
      sm: "p-3 sm:p-4",
      md: "p-4 sm:p-6",
      lg: "p-6 sm:p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
