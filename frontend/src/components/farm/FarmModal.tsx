import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { MapPicker } from "./MapPicker";
import { MapPin, Droplets, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { Farm, CreateFarmPayload, UpdateFarmPayload } from "../../services/farmService";

interface FarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmToEdit?: Farm | null;
  onSave: (payload: CreateFarmPayload | UpdateFarmPayload) => Promise<void>;
}

export const FarmModal: React.FC<FarmModalProps> = ({
  isOpen,
  onClose,
  farmToEdit,
  onSave,
}) => {
  const isEditing = !!farmToEdit;

  const [name, setName] = useState("");
  const [landArea, setLandArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("acres");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState<number>(11.1271);
  const [longitude, setLongitude] = useState<number>(78.6569);
  const [waterSource, setWaterSource] = useState("Borewell");
  const [irrigationMethod, setIrrigationMethod] = useState("Drip");

  // Optional soil health fields during creation
  const [includeSoil, setIncludeSoil] = useState(false);
  const [soilType, setSoilType] = useState("loamy");
  const [ph, setPh] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (farmToEdit) {
      setName(farmToEdit.name);
      setLandArea(String(farmToEdit.land_area));
      setAreaUnit(farmToEdit.area_unit || "acres");
      setLocationName(farmToEdit.location_name);
      setLatitude(farmToEdit.latitude);
      setLongitude(farmToEdit.longitude);
      setWaterSource(farmToEdit.water_source || "Borewell");
      setIrrigationMethod(farmToEdit.irrigation_method || "Drip");
      setIncludeSoil(false);
    } else {
      setName("");
      setLandArea("");
      setAreaUnit("acres");
      setLocationName("");
      // Default to Tamil Nadu coordinates
      setLatitude(11.1271);
      setLongitude(78.6569);
      setWaterSource("Borewell");
      setIrrigationMethod("Drip");
      setIncludeSoil(false);
      setSoilType("loamy");
      setPh("");
      setNitrogen("");
      setPhosphorus("");
      setPotassium("");
    }
    setError(null);
  }, [farmToEdit, isOpen]);

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide a name for your farm parcel.");
      return;
    }
    const areaNum = parseFloat(landArea);
    if (isNaN(areaNum) || areaNum <= 0) {
      setError("Please specify a valid cultivable land area greater than 0.");
      return;
    }
    if (!locationName.trim()) {
      setError("Please specify the village or district location.");
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        const updatePayload: UpdateFarmPayload = {
          name: name.trim(),
          land_area: areaNum,
          area_unit: areaUnit,
          location_name: locationName.trim(),
          latitude,
          longitude,
          water_source: waterSource,
          irrigation_method: irrigationMethod,
        };
        await onSave(updatePayload);
      } else {
        const createPayload: CreateFarmPayload = {
          name: name.trim(),
          land_area: areaNum,
          area_unit: areaUnit,
          location_name: locationName.trim(),
          latitude,
          longitude,
          water_source: waterSource,
          irrigation_method: irrigationMethod,
        };

        if (includeSoil) {
          createPayload.soil = {
            soil_type: soilType,
            ph: ph ? parseFloat(ph) : null,
            nitrogen_n: nitrogen ? parseFloat(nitrogen) : null,
            phosphorus_p: phosphorus ? parseFloat(phosphorus) : null,
            potassium_k: potassium ? parseFloat(potassium) : null,
          };
        }

        await onSave(createPayload);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save farm details.");
    } finally {
      setLoading(false);
    }
  };

  const waterSources = [
    { value: "Borewell", label: "Borewell" },
    { value: "Canal", label: "Canal" },
    { value: "Rainfed", label: "Rainfed" },
    { value: "Open Well", label: "Open Well" },
    { value: "River", label: "River / Stream" },
    { value: "Farm Pond", label: "Farm Pond / Tank" },
  ];

  const irrigationMethods = [
    { value: "Drip", label: "Drip Irrigation" },
    { value: "Sprinkler", label: "Sprinkler Irrigation" },
    { value: "Flood", label: "Surface / Flood Irrigation" },
    { value: "Furrow", label: "Furrow Irrigation" },
    { value: "Rainfed", label: "Purely Rainfed (No irrigation)" },
  ];

  const areaUnits = [
    { value: "acres", label: "Acres" },
    { value: "hectares", label: "Hectares" },
    { value: "cents", label: "Cents" },
    { value: "bigha", label: "Bigha" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Farm Parcel" : "Register New Farm Parcel"}
      description="Configure farm boundary coordinates, acreage, and irrigation setup."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Farm Parcel Name"
          placeholder="e.g. Cauvery Delta North, Green Meadows"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Total Land Area"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="e.g. 3.5"
            value={landArea}
            onChange={(e) => setLandArea(e.target.value)}
            required
          />
          <Select
            label="Measurement Unit"
            value={areaUnit}
            onChange={(e) => setAreaUnit(e.target.value)}
            options={areaUnits}
          />
        </div>

        <Input
          label="Location (Village, District, State)"
          placeholder="e.g. Thanjavur, Tamil Nadu"
          leftIcon={<MapPin className="w-4 h-4" />}
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          required
        />

        {/* Leaflet OpenStreetMap Coordinate Picker */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-agri-text">
              Farm Geographic Coordinates
            </label>
            <span className="text-xs text-agri-muted">
              GPS enables accurate microclimate weather alerts
            </span>
          </div>

          <MapPicker
            latitude={latitude}
            longitude={longitude}
            onChange={handleCoordinatesChange}
            heightClass="h-56"
          />

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Input
              label="Latitude"
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
              className="text-xs font-mono"
            />
            <Input
              label="Longitude"
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
              className="text-xs font-mono"
            />
          </div>
        </div>

        {/* Water & Irrigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Select
            label="Primary Water Source"
            value={waterSource}
            onChange={(e) => setWaterSource(e.target.value)}
            options={waterSources}
          />
          <Select
            label="Irrigation System"
            value={irrigationMethod}
            onChange={(e) => setIrrigationMethod(e.target.value)}
            options={irrigationMethods}
          />
        </div>

        {/* Optional Initial Soil Data during Creation */}
        {!isEditing && (
          <div className="border border-agri-border rounded-2xl p-3.5 bg-agri-bg/40 space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => setIncludeSoil(!includeSoil)}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeSoil"
                  checked={includeSoil}
                  onChange={(e) => setIncludeSoil(e.target.checked)}
                  className="rounded text-agri-primary focus:ring-agri-primary w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="includeSoil"
                  className="text-sm font-semibold text-agri-text cursor-pointer"
                >
                  I have recent soil test results (Optional)
                </label>
              </div>
              <span className="text-slate-400">
                {includeSoil ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </div>

            {includeSoil && (
              <div className="space-y-3 pt-2 border-t border-agri-border/60">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Soil pH"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 6.8"
                    value={ph}
                    onChange={(e) => setPh(e.target.value)}
                  />
                  <Select
                    label="Soil Texture"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    options={[
                      { value: "loamy", label: "Loamy" },
                      { value: "clay", label: "Clay" },
                      { value: "sandy", label: "Sandy" },
                      { value: "red soil", label: "Red Soil" },
                      { value: "black soil", label: "Black Soil" },
                      { value: "unknown", label: "Unknown" },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    label="Nitrogen (N)"
                    placeholder="kg/ha"
                    value={nitrogen}
                    onChange={(e) => setNitrogen(e.target.value)}
                  />
                  <Input
                    label="Phosphorus (P)"
                    placeholder="kg/ha"
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(e.target.value)}
                  />
                  <Input
                    label="Potassium (K)"
                    placeholder="kg/ha"
                    value={potassium}
                    onChange={(e) => setPotassium(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-agri-border">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={loading}>
            {isEditing ? "Save Changes" : "Register Farm"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
