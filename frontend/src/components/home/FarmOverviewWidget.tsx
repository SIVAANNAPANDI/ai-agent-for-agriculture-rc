import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { MapPin, ArrowRight, Plus, Tractor, Layers, Droplets } from "lucide-react";
import type { Farm } from "../../services/farmService";

interface FarmOverviewWidgetProps {
  farm: Farm | null;
  totalFarmsCount: number;
}

export const FarmOverviewWidget: React.FC<FarmOverviewWidgetProps> = ({
  farm,
  totalFarmsCount,
}) => {
  if (!farm) {
    return (
      <Card variant="surface" className="flex flex-col justify-between h-full space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base text-agri-text flex items-center gap-2">
              <Tractor className="w-4 h-4 text-agri-primary" />
              <span>Farm Overview</span>
            </h3>
            <Badge variant="neutral">Not Setup</Badge>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
            <p className="text-xs text-agri-muted leading-relaxed">
              No farm parcel registered yet. Add your land coordinates and soil type to unlock precision intelligence.
            </p>
          </div>
        </div>
        <Link to="/farm" className="pt-2">
          <Button variant="primary" size="sm" className="w-full justify-center" leftIcon={<Plus className="w-4 h-4" />}>
            Set Up Your Farm
          </Button>
        </Link>
      </Card>
    );
  }

  const soilPhDisplay = farm.soil?.ph ? `pH ${farm.soil.ph.toFixed(1)}` : "pH not tested";
  const soilTypeDisplay = farm.soil?.soil_type && farm.soil.soil_type !== "unknown" ? farm.soil.soil_type : "Loamy Soil";

  return (
    <Card variant="surface" className="flex flex-col justify-between h-full space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-base text-agri-text">{farm.name}</h3>
            <span className="text-xs text-agri-muted flex items-center gap-1 mt-0.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-agri-primary shrink-0" />
              {farm.location_name}
            </span>
          </div>
          <Badge variant="success">
            {totalFarmsCount > 1 ? `${totalFarmsCount} Parcels` : "Primary Farm"}
          </Badge>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm pt-1">
          <div className="flex justify-between py-1.5 border-b border-agri-border/60">
            <span className="text-agri-muted font-medium">Cultivable Area</span>
            <span className="font-bold text-agri-text">
              {farm.land_area} {farm.area_unit}
            </span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-agri-border/60">
            <span className="text-agri-muted font-medium">Soil Chemistry</span>
            <span className="font-bold text-agri-text capitalize">
              {soilTypeDisplay} ({soilPhDisplay})
            </span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-agri-border/60">
            <span className="text-agri-muted font-medium">Irrigation System</span>
            <span className="font-bold text-agri-text">
              {farm.irrigation_method || "Drip"} ({farm.water_source || "Borewell"})
            </span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-agri-muted font-medium">GPS Geolocation</span>
            <span className="font-mono text-xs font-semibold text-agri-text">
              {farm.latitude.toFixed(4)}°, {farm.longitude.toFixed(4)}°
            </span>
          </div>
        </div>
      </div>

      <Link to="/farm" className="pt-2">
        <Button variant="outline" size="sm" className="w-full justify-between">
          <span>Manage Farm & Soil</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </Card>
  );
};
