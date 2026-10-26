import React, { useState, useEffect, useCallback } from "react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { MapPicker } from "../../components/farm/MapPicker";
import { SoilCard } from "../../components/farm/SoilCard";
import { FarmModal } from "../../components/farm/FarmModal";
import { SoilModal } from "../../components/farm/SoilModal";
import { Modal } from "../../components/ui/Modal";
import {
  farmService,
  type Farm,
  type CreateFarmPayload,
  type UpdateFarmPayload,
  type UpdateSoilPayload,
} from "../../services/farmService";
import {
  MapPin,
  Droplets,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Tractor,
  Layers,
  Compass,
} from "lucide-react";

export const FarmPage: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSoilModalOpen, setIsSoilModalOpen] = useState<boolean>(false);
  const [farmToDelete, setFarmToDelete] = useState<Farm | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load farms from API
  const loadFarms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await farmService.getFarms();
      setFarms(data);
      if (data.length > 0) {
        // Keep current selection or default to first farm
        setSelectedFarmId((prev) =>
          prev && data.some((f) => f.id === prev) ? prev : data[0].id
        );
      } else {
        setSelectedFarmId(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load farm parcels. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  // Selected farm object
  const activeFarm = farms.find((f) => f.id === selectedFarmId) || farms[0] || null;

  // Handlers for Add/Edit Farm
  const handleSaveFarm = async (payload: CreateFarmPayload | UpdateFarmPayload) => {
    if (activeFarm && isEditModalOpen) {
      await farmService.updateFarm(activeFarm.id, payload as UpdateFarmPayload);
    } else {
      await farmService.createFarm(payload as CreateFarmPayload);
    }
    await loadFarms();
  };

  // Handler for Soil update
  const handleSaveSoil = async (farmId: number, payload: UpdateSoilPayload) => {
    await farmService.updateSoil(farmId, payload);
    await loadFarms();
  };

  // Handler for Farm deletion
  const handleDeleteFarm = async () => {
    if (!farmToDelete) return;
    try {
      setIsDeleting(true);
      await farmService.deleteFarm(farmToDelete.id);
      setFarmToDelete(null);
      await loadFarms();
    } catch (err: any) {
      setError(err.message || "Failed to delete farm parcel.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Total acreage calculation
  const totalAcreage = farms.reduce((acc, f) => {
    if (f.area_unit === "acres") return acc + f.land_area;
    if (f.area_unit === "hectares") return acc + f.land_area * 2.47105;
    if (f.area_unit === "cents") return acc + f.land_area * 0.01;
    return acc + f.land_area;
  }, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-text">
              My Farm Parcels
            </h1>
            {farms.length > 0 && (
              <Badge variant="success" className="text-xs">
                {farms.length} {farms.length === 1 ? "Parcel" : "Parcels"} (
                {totalAcreage.toFixed(1)} Acres Total)
              </Badge>
            )}
          </div>
          <p className="text-sm text-agri-muted mt-1">
            Manage field coordinates, acreage, irrigation sources, and laboratory soil health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="surface"
            size="md"
            onClick={loadFarms}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="border border-agri-border"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Farm Parcel
          </Button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadFarms} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && farms.length === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-3xl" />
          <div className="h-96 bg-slate-200 rounded-3xl" />
        </div>
      )}

      {/* Empty State (No Farms Registered) */}
      {!loading && farms.length === 0 && (
        <Card variant="surface" className="py-16 px-6 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-agri-primary/10 flex items-center justify-center text-agri-primary shadow-inner">
            <Tractor className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-agri-text">
              No Farm Parcels Registered Yet
            </h2>
            <p className="text-sm text-agri-muted max-w-md mx-auto leading-relaxed">
              Register your land parcel by pin-pointing coordinates on OpenStreetMap. This allows
              AgriAssist to deliver hyper-local weather alerts, precision crop recommendations, and
              customized fertilizer schedules.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="w-5 h-5" />}
              className="shadow-lg shadow-agri-primary/20"
            >
              Register Your First Farm
            </Button>
          </div>
        </Card>
      )}

      {/* Main Content Area when Farms Exist */}
      {!loading && farms.length > 0 && activeFarm && (
        <div className="space-y-6">
          {/* Multiple Farms Selector Bar */}
          {farms.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-semibold text-agri-muted flex-shrink-0 uppercase tracking-wider mr-1">
                Select Farm:
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
                  <MapPin className="w-3.5 h-3.5 opacity-80" />
                  <span>{f.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      selectedFarmId === f.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {f.land_area} {f.area_unit}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Farm Detail & Soil Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Farm Overview & Map Card */}
            <Card variant="surface" className="lg:col-span-2 space-y-5">
              {/* Card Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-agri-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-agri-text">{activeFarm.name}</h2>
                    {activeFarm.current_crop && (
                      <Badge variant="primary" className="text-xs">
                        {activeFarm.current_crop}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-agri-muted flex items-center gap-1.5 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-agri-primary flex-shrink-0" />
                    {activeFarm.location_name} (
                    {activeFarm.latitude.toFixed(4)}° N, {activeFarm.longitude.toFixed(4)}° E)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    leftIcon={<Edit className="w-3.5 h-3.5" />}
                    className="text-xs py-1.5 px-3"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFarmToDelete(activeFarm)}
                    className="text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Farm Spec Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-agri-bg rounded-2xl border border-agri-border">
                  <span className="text-xs text-agri-muted font-medium block">Land Area</span>
                  <span className="text-base font-bold text-agri-text mt-0.5 block">
                    {activeFarm.land_area} {activeFarm.area_unit}
                  </span>
                </div>

                <div className="p-3 bg-agri-bg rounded-2xl border border-agri-border">
                  <span className="text-xs text-agri-muted font-medium block">Water Source</span>
                  <span className="text-base font-bold text-agri-text mt-0.5 block">
                    {activeFarm.water_source || "Borewell"}
                  </span>
                </div>

                <div className="p-3 bg-agri-bg rounded-2xl border border-agri-border">
                  <span className="text-xs text-agri-muted font-medium block">Irrigation Type</span>
                  <span className="text-base font-bold text-agri-text mt-0.5 block">
                    {activeFarm.irrigation_method || "Drip"}
                  </span>
                </div>

                <div className="p-3 bg-agri-bg rounded-2xl border border-agri-border">
                  <span className="text-xs text-agri-muted font-medium block">Soil Texture</span>
                  <span className="text-base font-bold text-agri-text mt-0.5 block capitalize">
                    {activeFarm.soil?.soil_type || "Loamy"}
                  </span>
                </div>
              </div>

              {/* Interactive OpenStreetMap Plot */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-agri-muted font-medium">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-agri-primary" />
                    OpenStreetMap Satellite & Boundary Geolocation
                  </span>
                  <span>Click 'Edit' to update coordinates</span>
                </div>
                <MapPicker
                  latitude={activeFarm.latitude}
                  longitude={activeFarm.longitude}
                  readOnly={true}
                  heightClass="h-64 sm:h-72"
                  zoom={14}
                />
              </div>
            </Card>

            {/* Soil Health Column */}
            <div className="space-y-6">
              <SoilCard
                soil={activeFarm.soil}
                onEditSoil={() => setIsSoilModalOpen(true)}
              />

              {/* Quick Agronomic Smart Tips */}
              <Card variant="surface" className="p-4 bg-emerald-50/50 border border-emerald-100/80 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Precision Agronomy Insight</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Based on your {activeFarm.soil?.soil_type || "loamy"} soil and{" "}
                  {activeFarm.irrigation_method || "Drip"} irrigation, this parcel is well-suited
                  for intensive horticulture and precision fertigation. Check Weather Intelligence for
                  daily evapotranspiration advisories.
                </p>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Create Farm Modal */}
      <FarmModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveFarm}
      />

      {/* Edit Farm Modal */}
      {activeFarm && (
        <FarmModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          farmToEdit={activeFarm}
          onSave={handleSaveFarm}
        />
      )}

      {/* Update Soil Health Modal */}
      {activeFarm && (
        <SoilModal
          isOpen={isSoilModalOpen}
          onClose={() => setIsSoilModalOpen(false)}
          farmId={activeFarm.id}
          initialSoil={activeFarm.soil}
          onSave={handleSaveSoil}
        />
      )}

      {/* Delete Farm Confirmation Modal */}
      <Modal
        isOpen={!!farmToDelete}
        onClose={() => setFarmToDelete(null)}
        title="Delete Farm Parcel"
        description="Are you sure you want to remove this farm parcel?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Deleting <strong>{farmToDelete?.name}</strong> will remove all associated boundary
            coordinates, soil records, and active cultivation cycles. This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-agri-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setFarmToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={handleDeleteFarm}
              isLoading={isDeleting}
            >
              Delete Parcel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
