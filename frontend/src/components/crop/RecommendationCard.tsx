import React, { useState } from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
  Check,
  X,
  Clock,
  Droplets,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  TrendingUp,
  Coins,
} from "lucide-react";
import type { CropRecommendationItem } from "../../services/recommendationService";

interface RecommendationCardProps {
  item: CropRecommendationItem;
  onAdopt: (item: CropRecommendationItem) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  onAdopt,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getScoreVariant = (score: number) => {
    if (score >= 85) return { badge: "success" as const, label: "Highly Recommended", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 70) return { badge: "primary" as const, label: "Well Suited", color: "text-agri-primary bg-agri-bg border-agri-border" };
    return { badge: "warning" as const, label: "Moderate Fit", color: "text-amber-800 bg-amber-50 border-amber-200" };
  };

  const scoreInfo = getScoreVariant(item.suitability_score);

  return (
    <Card
      variant="surface"
      className="flex flex-col justify-between h-full p-5 space-y-4 hover:shadow-md transition-shadow border-agri-border"
    >
      <div>
        {/* Header with Crop Name and Match Badge */}
        <div className="flex items-start justify-between gap-3 border-b border-agri-border pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shrink-0 shadow-sm">
              {item.icon_url || "🌱"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-agri-text">
                  {item.crop_name}
                </h3>
                <span className="text-xs text-agri-muted font-medium">
                  {item.crop_tamil_name}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="neutral" className="text-[10px] py-0 capitalize">
                  {item.category}
                </Badge>
                <span className="text-xs text-agri-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.duration_days} Days
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xl sm:text-2xl font-black text-agri-primary block">
              {item.suitability_score}%
            </span>
            <Badge variant={scoreInfo.badge} className="text-[10px] py-0.5">
              {scoreInfo.label}
            </Badge>
          </div>
        </div>

        {/* Compatibility Pills */}
        <div className="grid grid-cols-3 gap-2 py-3">
          <div
            className={`p-2 rounded-xl border text-center text-[11px] font-semibold flex items-center justify-center gap-1 ${
              item.soil_compatible
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {item.soil_compatible ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-red-600" />}
            <span>Soil Match</span>
          </div>

          <div
            className={`p-2 rounded-xl border text-center text-[11px] font-semibold flex items-center justify-center gap-1 ${
              item.ph_compatible
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            {item.ph_compatible ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-amber-600" />}
            <span>pH Tolerance</span>
          </div>

          <div
            className={`p-2 rounded-xl border text-center text-[11px] font-semibold flex items-center justify-center gap-1 ${
              item.water_compatible
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            {item.water_compatible ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-amber-600" />}
            <span>Water Fit</span>
          </div>
        </div>

        {/* 4 Pillars of Explainable Agronomy */}
        <div className="space-y-2.5 text-xs">
          {/* WHAT */}
          <div className="p-3 bg-agri-bg rounded-xl border border-agri-border/80">
            <span className="font-bold text-agri-text block mb-0.5">
              📌 Agronomic Potential (WHAT)
            </span>
            <p className="text-agri-muted leading-relaxed">
              {item.what_summary}
            </p>
          </div>

          {/* WHY */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="font-bold text-emerald-950 block mb-0.5">
              🔬 Scientific Justification (WHY)
            </span>
            <p className="text-emerald-800 leading-relaxed">
              {item.why_reason}
            </p>
          </div>

          {/* Expandable WHEN & NEXT STEPS */}
          {expanded ? (
            <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-950 block mb-0.5">
                  🗓️ Optimal Planting Window (WHEN)
                </span>
                <p className="text-blue-800 leading-relaxed">
                  {item.when_window}
                </p>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                <span className="font-bold text-purple-950 block mb-0.5">
                  🚀 Recommended Action Plan (NEXT STEPS)
                </span>
                <p className="text-purple-800 leading-relaxed">
                  {item.next_steps}
                </p>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-bold text-agri-primary hover:underline flex items-center gap-1 pt-1"
          >
            {expanded ? (
              <>
                <span>Show Less</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>View Planting Window & Preparation Steps</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Economic Yield & Input Cost Badges */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-agri-border/60 text-[11px]">
          <div>
            <span className="text-agri-muted block">Expected Yield</span>
            <strong className="text-agri-text font-bold">
              {item.yield_potential || "Standard"}
            </strong>
          </div>
          <div>
            <span className="text-agri-muted block">Est. Cost / Acre</span>
            <strong className="text-agri-text font-bold">
              {item.input_cost_per_acre ? `₹${item.input_cost_per_acre.toLocaleString("en-IN")}` : "Moderate"}
            </strong>
          </div>
        </div>
      </div>

      {/* Adopt Action Button */}
      <div className="pt-3">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onAdopt(item)}
          className="w-full justify-between shadow-sm"
        >
          <span>Adopt Crop & Plan Cycle</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
