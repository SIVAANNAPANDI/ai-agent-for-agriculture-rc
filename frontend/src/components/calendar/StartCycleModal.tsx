import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Sprout, AlertCircle, Calendar, Sparkles } from "lucide-react";
import type { Farm } from "../../services/farmService";
import type { CropOption, CreateCyclePayload } from "../../services/cultivationService";

interface StartCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms: Farm[];
  crops: CropOption[];
  onStartCycle: (payload: CreateCyclePayload) => Promise<void>;
}

export const StartCycleModal: React.FC<StartCycleModalProps> = ({
  isOpen,
  onClose,
  farms,
  crops,
  onStartCycle,
}) => {
  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [selectedCropId, setSelectedCropId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [estimatedYield, setEstimatedYield] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (farms.length > 0 && !selectedFarmId) {
      setSelectedFarmId(String(farms[0].id));
    }
    if (crops.length > 0 && !selectedCropId) {
      setSelectedCropId(String(crops[0].id));
    }
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setError(null);
  }, [farms, crops, isOpen]);

  const activeCrop = crops.find((c) => String(c.id) === selectedCropId);

  // Compute expected harvest date
  const computeHarvestDate = () => {
    if (!startDate || !activeCrop) return "";
    const start = new Date(startDate);
    start.setDate(start.getDate() + activeCrop.typical_duration_days);
    return start.toISOString().split("T")[0];
  };

  const expectedHarvestDate = computeHarvestDate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const farmIdNum = parseInt(selectedFarmId);
    const cropIdNum = parseInt(selectedCropId);

    if (!farmIdNum || isNaN(farmIdNum)) {
      setError("Please select a farm parcel.");
      return;
    }
    if (!cropIdNum || isNaN(cropIdNum)) {
      setError("Please select a crop.");
      return;
    }
    if (!startDate) {
      setError("Please specify the sowing / transplanting date.");
      return;
    }

    try {
      setLoading(true);
      await onStartCycle({
        farm_id: farmIdNum,
        crop_id: cropIdNum,
        start_date: startDate,
        expected_harvest_date: expectedHarvestDate || null,
        estimated_yield: estimatedYield || null,
        notes: notes || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to start cultivation cycle.");
    } finally {
      setLoading(false);
    }
  };

  const farmOptions = farms.map((f) => ({
    value: String(f.id),
    label: f.name,
    sublabel: `${f.land_area} ${f.area_unit}`,
  }));

  const cropOptions = crops.map((c) => ({
    value: String(c.id),
    label: `${c.name} (${c.tamil_name})`,
    sublabel: `${c.typical_duration_days} days • ${c.category}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start New Cultivation Cycle"
      description="Initialize crop phenology tracking and automatically generate scheduled agronomic tasks."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {farms.length === 0 ? (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
            <span className="font-bold block">No Farm Parcel Available</span>
            <p>Please register a farm parcel first before starting a cultivation cycle.</p>
          </div>
        ) : (
          <>
            <Select
              label="Select Farm Parcel"
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              options={farmOptions}
            />

            <Select
              label="Select Crop"
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              options={cropOptions}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Sowing / Planting Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-agri-text">
                  Expected Harvest
                </label>
                <div className="h-12 px-4 rounded-xl border border-agri-border bg-slate-50 flex items-center text-sm font-semibold text-agri-text">
                  <Calendar className="w-4 h-4 text-agri-primary mr-2" />
                  {expectedHarvestDate || "—"}
                </div>
              </div>
            </div>

            {activeCrop && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    Automated Agronomic Blueprint ({activeCrop.typical_duration_days} Days)
                  </span>
                  <p className="text-emerald-800 mt-0.5 leading-relaxed">
                    AgriAssist will automatically schedule basal fertilizer, cono-weeding, vegetative fertigation, flowering boron sprays, and harvest alerts.
                  </p>
                </div>
              </div>
            )}

            <Input
              label="Estimated Target Yield (Optional)"
              placeholder="e.g. 15-20 Tonnes/acre"
              value={estimatedYield}
              onChange={(e) => setEstimatedYield(e.target.value)}
            />

            <Input
              label="Field Notes (Optional)"
              placeholder="e.g. Certified seeds, treated with Trichoderma viride"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-agri-border">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            disabled={farms.length === 0}
          >
            Start Cycle
          </Button>
        </div>
      </form>
    </Modal>
  );
};
