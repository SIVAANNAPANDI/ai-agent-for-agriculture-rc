import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { FlaskConical, AlertCircle } from "lucide-react";
import type { SoilData, UpdateSoilPayload } from "../../services/farmService";

interface SoilModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmId: number;
  initialSoil: SoilData | null | undefined;
  onSave: (farmId: number, data: UpdateSoilPayload) => Promise<void>;
}

export const SoilModal: React.FC<SoilModalProps> = ({
  isOpen,
  onClose,
  farmId,
  initialSoil,
  onSave,
}) => {
  const [soilType, setSoilType] = useState<string>("loamy");
  const [ph, setPh] = useState<string>("");
  const [organicMatter, setOrganicMatter] = useState<string>("");
  const [nitrogen, setNitrogen] = useState<string>("");
  const [phosphorus, setPhosphorus] = useState<string>("");
  const [potassium, setPotassium] = useState<string>("");
  const [ec, setEc] = useState<string>("");
  const [testedAt, setTestedAt] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSoil) {
      setSoilType(initialSoil.soil_type || "loamy");
      setPh(initialSoil.ph !== null && initialSoil.ph !== undefined ? String(initialSoil.ph) : "");
      setOrganicMatter(initialSoil.organic_matter_pct !== null && initialSoil.organic_matter_pct !== undefined ? String(initialSoil.organic_matter_pct) : "");
      setNitrogen(initialSoil.nitrogen_n !== null && initialSoil.nitrogen_n !== undefined ? String(initialSoil.nitrogen_n) : "");
      setPhosphorus(initialSoil.phosphorus_p !== null && initialSoil.phosphorus_p !== undefined ? String(initialSoil.phosphorus_p) : "");
      setPotassium(initialSoil.potassium_k !== null && initialSoil.potassium_k !== undefined ? String(initialSoil.potassium_k) : "");
      setEc(initialSoil.ec !== null && initialSoil.ec !== undefined ? String(initialSoil.ec) : "");
      setTestedAt(initialSoil.tested_at || "");
    } else {
      setSoilType("loamy");
      setPh("");
      setOrganicMatter("");
      setNitrogen("");
      setPhosphorus("");
      setPotassium("");
      setEc("");
      setTestedAt("");
    }
    setError(null);
  }, [initialSoil, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate pH if provided
    const parsedPh = ph ? parseFloat(ph) : null;
    if (parsedPh !== null && (isNaN(parsedPh) || parsedPh < 3.0 || parsedPh > 11.0)) {
      setError("Soil pH must be between 3.0 and 11.0.");
      return;
    }

    const payload: UpdateSoilPayload = {
      soil_type: soilType,
      ph: parsedPh,
      organic_matter_pct: organicMatter ? parseFloat(organicMatter) : null,
      nitrogen_n: nitrogen ? parseFloat(nitrogen) : null,
      phosphorus_p: phosphorus ? parseFloat(phosphorus) : null,
      potassium_k: potassium ? parseFloat(potassium) : null,
      ec: ec ? parseFloat(ec) : null,
      tested_at: testedAt || null,
    };

    try {
      setLoading(true);
      await onSave(farmId, payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update soil health parameters.");
    } finally {
      setLoading(false);
    }
  };

  const soilTypeOptions = [
    { value: "loamy", label: "Loamy Soil", sublabel: "Well-balanced, fertile" },
    { value: "clay", label: "Clay Soil", sublabel: "High moisture, heavy" },
    { value: "sandy", label: "Sandy Soil", sublabel: "Free-draining, light" },
    { value: "silty", label: "Silty Soil", sublabel: "Rich, smooth, retains water" },
    { value: "red soil", label: "Red Soil", sublabel: "Iron-rich, permeable" },
    { value: "black soil", label: "Black Soil (Regur)", sublabel: "Ideal for cotton" },
    { value: "laterite", label: "Laterite Soil", sublabel: "Acidic, porous" },
    { value: "unknown", label: "I don't know / Skip", sublabel: "Default estimation" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Soil Chemistry & Health Profile"
      description="Update laboratory soil test values to personalize crop fertilizer advisories."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Select
          label="Soil Classification"
          value={soilType}
          onChange={(e) => setSoilType(e.target.value)}
          options={soilTypeOptions}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Soil pH"
            type="number"
            step="0.1"
            min="3.0"
            max="11.0"
            placeholder="e.g. 6.5"
            value={ph}
            onChange={(e) => setPh(e.target.value)}
            helperText="3.0 (Acidic) - 11.0 (Alkaline)"
          />
          <Input
            label="Organic Matter (%)"
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="e.g. 1.5"
            value={organicMatter}
            onChange={(e) => setOrganicMatter(e.target.value)}
            helperText="Typical: 0.5% - 3.0%"
          />
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <span className="text-xs font-bold text-agri-text flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-agri-primary" />
            Primary Macronutrients (NPK)
          </span>

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Nitrogen (N)"
              type="number"
              step="1"
              placeholder="kg/ha"
              value={nitrogen}
              onChange={(e) => setNitrogen(e.target.value)}
              helperText="Opt: 240-480"
            />
            <Input
              label="Phosphorus (P)"
              type="number"
              step="1"
              placeholder="kg/ha"
              value={phosphorus}
              onChange={(e) => setPhosphorus(e.target.value)}
              helperText="Opt: 11-25"
            />
            <Input
              label="Potassium (K)"
              type="number"
              step="1"
              placeholder="kg/ha"
              value={potassium}
              onChange={(e) => setPotassium(e.target.value)}
              helperText="Opt: 110-280"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Electrical Conductivity (EC)"
            type="number"
            step="0.01"
            placeholder="dS/m"
            value={ec}
            onChange={(e) => setEc(e.target.value)}
            helperText="Ideal < 1.0 dS/m"
          />
          <Input
            label="Soil Test Date"
            type="date"
            value={testedAt}
            onChange={(e) => setTestedAt(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-agri-border">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={loading}>
            Save Soil Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};
