import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation, Crosshair, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
  heightClass?: string;
  zoom?: number;
}

// Custom modern SVG pin marker for Leaflet
const createPinIcon = (color = "#166534") => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="${color}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

function MapClickHandler({
  onSelect,
  disabled,
}: {
  onSelect: (lat: number, lng: number) => void;
  disabled?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!disabled) {
        onSelect(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
      }
    },
  });
  return null;
}

function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  onChange,
  readOnly = false,
  heightClass = "h-72",
  zoom = 13,
}) => {
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Validate coordinates or fallback to Tamil Nadu center (11.1271, 78.6569)
  const safeLat = typeof latitude === "number" && !isNaN(latitude) ? latitude : 11.1271;
  const safeLng = typeof longitude === "number" && !isNaN(longitude) ? longitude : 78.6569;

  const center: [number, number] = useMemo(() => [safeLat, safeLng], [safeLat, safeLng]);
  const markerIcon = useMemo(() => createPinIcon(), []);

  const handleMarkerDragEnd = (e: L.DragEndEvent) => {
    if (readOnly || !onChange) return;
    const marker = e.target;
    const position = marker.getLatLng();
    onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        if (onChange) {
          onChange(
            Number(pos.coords.latitude.toFixed(6)),
            Number(pos.coords.longitude.toFixed(6))
          );
        }
      },
      (err) => {
        setIsLocating(false);
        setGeoError(err.message || "Failed to retrieve your current location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-agri-border shadow-sm">
      <div className={`w-full ${heightClass}`}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={!readOnly}
          dragging={!readOnly}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewController center={center} zoom={zoom} />
          {!readOnly && onChange && (
            <MapClickHandler onSelect={onChange} disabled={readOnly} />
          )}
          <Marker
            position={center}
            icon={markerIcon}
            draggable={!readOnly}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
          />
        </MapContainer>
      </div>

      {/* Floating Coordinates & GPS Controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col items-end gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-agri-border shadow-md text-xs flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-agri-primary" />
          <span className="font-mono font-medium text-agri-text">
            {safeLat.toFixed(4)}°, {safeLng.toFixed(4)}°
          </span>
        </div>

        {!readOnly && onChange && (
          <Button
            type="button"
            variant="surface"
            size="sm"
            onClick={handleGetCurrentLocation}
            isLoading={isLocating}
            leftIcon={<Crosshair className="w-3.5 h-3.5 text-agri-primary" />}
            className="pointer-events-auto shadow-md bg-white hover:bg-slate-50 text-xs py-1.5 px-3 rounded-xl border border-agri-border"
          >
            Locate Me
          </Button>
        )}
      </div>

      {/* Help Instructions for Interactive Mode */}
      {!readOnly && (
        <div className="absolute bottom-2 left-3 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-agri-border/60 text-[11px] text-agri-muted">
          Click map or drag the pin to set farm coordinates
        </div>
      )}

      {geoError && (
        <div className="p-2 bg-red-50 border-t border-red-200 text-red-700 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{geoError}</span>
        </div>
      )}
    </div>
  );
};
