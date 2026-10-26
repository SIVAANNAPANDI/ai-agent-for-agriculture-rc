import React from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Layers, Edit3, FlaskConical, AlertCircle, CheckCircle2 } from "lucide-react";
import type { SoilData } from "../../services/farmService";

interface SoilCardProps {
  soil: SoilData | null | undefined;
  onEditSoil: () => void;
}

export const SoilCard: React.FC<SoilCardProps> = ({ soil, onEditSoil }) => {
  // If soil is missing or completely untested
  const isUntested =
    !soil ||
    (soil.soil_type === "unknown" &&
      soil.ph === null &&
      soil.nitrogen_n === null &&
      soil.phosphorus_p === null &&
      soil.potassium_k === null);

  // Agronomic rating calculations
  const getPhStatus = (ph: number | null | undefined) => {
    if (ph === null || ph === undefined) return { label: "Not Tested", variant: "neutral" as const, desc: "Standard pH 6.5 assumed" };
    if (ph < 5.5) return { label: "Strongly Acidic", variant: "danger" as const, desc: "Add agricultural lime" };
    if (ph < 6.5) return { label: "Slightly Acidic", variant: "warning" as const, desc: "Good for potatoes, tea" };
    if (ph <= 7.5) return { label: "Optimal / Neutral", variant: "success" as const, desc: "Ideal for most crops" };
    if (ph <= 8.5) return { label: "Moderately Alkaline", variant: "warning" as const, desc: "Add gypsum or sulfur" };
    return { label: "Strongly Alkaline", variant: "danger" as const, desc: "High salinity risk" };
  };

  const getNutrientStatus = (val: number | null | undefined, low: number, high: number) => {
    if (val === null || val === undefined) return { label: "Not Tested", pct: 50, color: "bg-slate-300", text: "text-slate-500" };
    if (val < low) return { label: `Low (${val} kg/ha)`, pct: Math.min(Math.round((val / low) * 40), 40), color: "bg-amber-500", text: "text-amber-700" };
    if (val <= high) return { label: `Optimal (${val} kg/ha)`, pct: Math.min(Math.round(40 + ((val - low) / (high - low)) * 40), 80), color: "bg-emerald-500", text: "text-emerald-700" };
    return { label: `High (${val} kg/ha)`, pct: 100, color: "bg-blue-500", text: "text-blue-700" };
  };

  const phStatus = getPhStatus(soil?.ph);
  const nStatus = getNutrientStatus(soil?.nitrogen_n, 240, 480);
  const pStatus = getNutrientStatus(soil?.phosphorus_p, 11, 25);
  const kStatus = getNutrientStatus(soil?.potassium_k, 110, 280);

  return (
    <Card variant="surface" className="space-y-4">
      <div className="flex items-center justify-between border-b border-agri-border pb-3">
        <h3 className="font-bold text-base text-agri-text flex items-center gap-2">
          <Layers className="w-5 h-5 text-agri-primary" />
          <span>Soil Health & Chemistry</span>
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEditSoil}
          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          className="text-xs py-1.5 px-2.5"
        >
          {isUntested ? "Add Lab Test" : "Update"}
        </Button>
      </div>

      {isUntested ? (
        <div className="space-y-3 py-2">
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3">
            <FlaskConical className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Soil Test Pending</span>
              <p className="text-amber-800 leading-relaxed">
                You haven't added lab test data for this farm parcel. AgriAssist will automatically use regional soil averages until you upload test parameters.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onEditSoil}
            className="w-full text-xs font-semibold"
          >
            Enter Soil Test (NPK, pH)
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Soil Classification & pH */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-agri-bg rounded-xl border border-agri-border">
              <span className="text-xs text-agri-muted block">Soil Texture</span>
              <span className="text-sm font-bold text-agri-text capitalize mt-0.5 block">
                {soil?.soil_type || "Loamy"}
              </span>
            </div>
            <div className="p-3 bg-agri-bg rounded-xl border border-agri-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-agri-muted">Soil pH</span>
                <Badge variant={phStatus.variant}>{phStatus.label}</Badge>
              </div>
              <span className="text-sm font-bold text-agri-text mt-0.5 block">
                {soil?.ph !== null && soil?.ph !== undefined ? soil.ph.toFixed(1) : "—"}
              </span>
            </div>
          </div>

          {/* NPK Progress Bars */}
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-agri-muted font-medium">Nitrogen (N)</span>
                <span className={`font-semibold ${nStatus.text}`}>{nStatus.label}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`${nStatus.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${nStatus.pct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-agri-muted font-medium">Phosphorus (P)</span>
                <span className={`font-semibold ${pStatus.text}`}>{pStatus.label}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`${pStatus.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${pStatus.pct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-agri-muted font-medium">Potassium (K)</span>
                <span className={`font-semibold ${kStatus.text}`}>{kStatus.label}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`${kStatus.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${kStatus.pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Organic Matter & EC */}
          <div className="flex items-center justify-between text-xs text-agri-muted pt-2 border-t border-agri-border">
            <span>
              Organic Matter:{" "}
              <strong className="text-agri-text">
                {soil?.organic_matter_pct !== null && soil?.organic_matter_pct !== undefined
                  ? `${soil.organic_matter_pct}%`
                  : "N/A"}
              </strong>
            </span>
            <span>
              EC:{" "}
              <strong className="text-agri-text">
                {soil?.ec !== null && soil?.ec !== undefined ? `${soil.ec} dS/m` : "N/A"}
              </strong>
            </span>
          </div>

          {soil?.tested_at && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tested on {soil.tested_at}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
