import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { RecommendationCard } from "../../components/crop/RecommendationCard";
import { StartCycleModal } from "../../components/calendar/StartCycleModal";
import {
  recommendationService,
  type CropRecommendationResponse,
  type CropRecommendationItem,
} from "../../services/recommendationService";
import { farmService, type Farm } from "../../services/farmService";
import {
  cultivationService,
  type CropOption,
  type CreateCyclePayload,
} from "../../services/cultivationService";
import {
  Sprout,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Layers,
  Droplets,
  Filter,
  CheckCircle2,
  Tractor,
} from "lucide-react";

export const RecommendationPage: React.FC = () => {
  const navigate = useNavigate();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [recommendationsData, setRecommendationsData] = useState<CropRecommendationResponse | null>(null);
  const [crops, setCrops] = useState<CropOption[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Adopt modal state
  const [isAdoptModalOpen, setIsAdoptModalOpen] = useState(false);
  const [cropToAdopt, setCropToAdopt] = useState<CropRecommendationItem | null>(null);

  // Load farms on mount
  useEffect(() => {
    const fetchFarmsAndCrops = async () => {
      try {
        setLoading(true);
        setError(null);
        const [farmsList, cropsList] = await Promise.all([
          farmService.getFarms(),
          cultivationService.getCrops(),
        ]);
        setFarms(farmsList);
        setCrops(cropsList);
        if (farmsList.length > 0) {
          setSelectedFarmId(farmsList[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load farms.");
      } finally {
        setLoading(false);
      }
    };
    fetchFarmsAndCrops();
  }, []);

  // Fetch recommendations when selected farm changes
  const fetchRecommendations = useCallback(async () => {
    if (!selectedFarmId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await recommendationService.getFarmRecommendations(selectedFarmId);
      setRecommendationsData(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate crop recommendations.");
    } finally {
      setLoading(false);
    }
  }, [selectedFarmId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || farms[0] || null;

  // Handle Adopt Crop
  const handleAdoptClick = (item: CropRecommendationItem) => {
    setCropToAdopt(item);
    setIsAdoptModalOpen(true);
  };

  const handleStartAdoptedCycle = async (payload: CreateCyclePayload) => {
    await cultivationService.createCycle(payload);
    setIsAdoptModalOpen(false);
    navigate("/calendar");
  };

  // Filter recommendations by category
  const filteredRecs = (recommendationsData?.recommendations || []).filter((item) => {
    if (activeCategory === "all") return true;
    return item.category.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-text">
              Crop Recommendation Engine
            </h1>
            <Badge variant="primary" className="text-xs">
              Multi-Factor Agronomy
            </Badge>
          </div>
          <p className="text-sm text-agri-muted mt-1">
            Explainable precision crop matching based on farm soil chemistry, irrigation capacity, and seasonal climate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="surface"
            size="md"
            onClick={fetchRecommendations}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="border border-agri-border"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRecommendations} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* Empty State: No Farms */}
      {!loading && farms.length === 0 && (
        <Card variant="surface" className="py-16 px-6 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-agri-primary/10 flex items-center justify-center text-agri-primary shadow-inner">
            <Tractor className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-agri-text">
              Register a Farm Parcel to Get Recommendations
            </h2>
            <p className="text-sm text-agri-muted max-w-md mx-auto leading-relaxed">
              AgriAssist calibrates recommendations against your specific soil texture, pH rating, and irrigation infrastructure.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/farm")}
              leftIcon={<Sprout className="w-5 h-5" />}
            >
              Add Your Farm Parcel
            </Button>
          </div>
        </Card>
      )}

      {/* Main Content */}
      {activeFarm && (
        <div className="space-y-6">
          {/* Farm Parcel Selector Bar (if multiple farms) */}
          {farms.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-semibold text-agri-muted flex-shrink-0 uppercase tracking-wider mr-1">
                Select Farm Parcel:
              </span>
              {farms.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFarmId(f.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 border ${
                    selectedFarmId === f.id
                      ? "bg-agri-primary text-white border-agri-primary shadow-sm"
                      : "bg-white text-agri-text border-agri-border hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Farm Calibration Specs Strip */}
          <Card variant="surface" className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/50 to-white border border-emerald-100/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-agri-primary uppercase tracking-wider block">
                  Calibrated For Parcel:
                </span>
                <h3 className="text-lg font-bold text-agri-text mt-0.5">
                  {activeFarm.name} • {activeFarm.land_area} {activeFarm.area_unit}
                </h3>
                <span className="text-xs text-agri-muted flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-agri-primary" />
                  {activeFarm.location_name}
                </span>
              </div>

              {/* Attributes Chips */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="px-3 py-1.5 bg-white rounded-xl border border-agri-border shadow-xs text-xs">
                  <span className="text-agri-muted block text-[10px]">Soil Texture</span>
                  <strong className="text-agri-text capitalize font-bold">
                    {activeFarm.soil?.soil_type || "Loamy"}
                  </strong>
                </div>

                <div className="px-3 py-1.5 bg-white rounded-xl border border-agri-border shadow-xs text-xs">
                  <span className="text-agri-muted block text-[10px]">Soil pH</span>
                  <strong className="text-agri-text font-bold">
                    {activeFarm.soil?.ph ? activeFarm.soil.ph.toFixed(1) : "6.5 (est)"}
                  </strong>
                </div>

                <div className="px-3 py-1.5 bg-white rounded-xl border border-agri-border shadow-xs text-xs">
                  <span className="text-agri-muted block text-[10px]">Irrigation System</span>
                  <strong className="text-agri-text font-bold">
                    {activeFarm.irrigation_method || "Drip"} ({activeFarm.water_source || "Borewell"})
                  </strong>
                </div>
              </div>
            </div>
          </Card>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Filter className="w-4 h-4 text-agri-muted shrink-0 mr-1" />
            {[
              { id: "all", label: "All Crops" },
              { id: "vegetable", label: "Vegetables" },
              { id: "cereal", label: "Cereals & Grains" },
              { id: "spice", label: "Spices" },
              { id: "cash_crop", label: "Cash Crops" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 border ${
                  activeCategory === cat.id
                    ? "bg-agri-primary text-white border-agri-primary shadow-xs"
                    : "bg-white text-agri-text border-agri-border hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecs.map((item) => (
              <RecommendationCard
                key={item.crop_id}
                item={item}
                onAdopt={handleAdoptClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Start Cycle Modal for Adopting Crop */}
      <StartCycleModal
        isOpen={isAdoptModalOpen}
        onClose={() => setIsAdoptModalOpen(false)}
        farms={farms}
        crops={crops}
        onStartCycle={handleStartAdoptedCycle}
      />
    </div>
  );
};
