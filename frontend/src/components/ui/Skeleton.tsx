import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
  width,
  height,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "circular":
        return "rounded-full";
      case "rounded":
        return "rounded-xl";
      case "text":
        return "rounded-md h-4";
      case "rectangular":
      default:
        return "rounded-lg";
    }
  };

  const style: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
  };

  return (
    <div
      style={style}
      className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 ${getVariantStyles()} ${className}`}
    />
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs ${className}`}>
    <div className="flex items-center justify-between">
      <Skeleton variant="text" className="w-1/3 h-5" />
      <Skeleton variant="rounded" className="w-16 h-6" />
    </div>
    <Skeleton variant="rounded" className="w-full h-32" />
    <div className="space-y-2">
      <Skeleton variant="text" className="w-3/4 h-4" />
      <Skeleton variant="text" className="w-1/2 h-3" />
    </div>
    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
      <Skeleton variant="text" className="w-1/4 h-4" />
      <Skeleton variant="rounded" className="w-24 h-8" />
    </div>
  </div>
);

export const WeatherWidgetSkeleton: React.FC = () => (
  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-800 to-green-950 text-white space-y-4 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="w-32 h-6 bg-white/20 rounded-md" />
      <div className="w-20 h-6 bg-white/20 rounded-full" />
    </div>
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-white/20 rounded-full" />
      <div className="space-y-2">
        <div className="w-24 h-8 bg-white/20 rounded-md" />
        <div className="w-36 h-4 bg-white/20 rounded-md" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
      <div className="h-10 bg-white/10 rounded-lg" />
      <div className="h-10 bg-white/10 rounded-lg" />
      <div className="h-10 bg-white/10 rounded-lg" />
    </div>
  </div>
);
