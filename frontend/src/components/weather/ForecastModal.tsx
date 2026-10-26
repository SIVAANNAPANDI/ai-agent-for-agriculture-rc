import React from "react";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  Waves,
} from "lucide-react";
import type { WeatherForecast } from "../../services/weatherService";

interface ForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  forecast: WeatherForecast | null;
}

export const ForecastModal: React.FC<ForecastModalProps> = ({
  isOpen,
  onClose,
  forecast,
}) => {
  if (!forecast) return null;

  const { current, daily, hourly, location_name, source } = forecast;
  const advisory = current.advisory;

  const getWeatherIcon = (condition: string, rainProb: number) => {
    if (rainProb >= 50 || condition.toLowerCase().includes("rain")) {
      return <CloudRain className="w-5 h-5 text-blue-500" />;
    }
    if (condition.toLowerCase().includes("clear") || condition.toLowerCase().includes("sun")) {
      return <Sun className="w-5 h-5 text-amber-500" />;
    }
    return <CloudSun className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`5-Day Microclimate Outlook • ${location_name}`}
      description="Hyper-local precision weather forecasting and agronomic decision intelligence."
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Source Badge & Status */}
        <div className="flex items-center justify-between text-xs text-agri-muted border-b border-agri-border pb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-agri-text">Data Source:</span>
            <Badge variant={source.includes("live") ? "success" : "info"} className="text-[10px]">
              {source === "live_openweather"
                ? "Live OpenWeather 2.5"
                : source === "cached_openweather"
                ? "Cached Microclimate (30m TTL)"
                : "Microclimate Simulation"}
            </Badge>
          </div>
          <span>Updated just now</span>
        </div>

        {/* 1. Agronomic Actionable Advisories */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>Irrigation Advisory</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              {advisory.irrigation_advisory}
            </p>
          </div>

          <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs">
              <Wind className="w-4 h-4 text-teal-600" />
              <span>Foliar Spray Advisory</span>
            </div>
            <p className="text-xs text-teal-800 leading-relaxed">
              {advisory.spray_advisory}
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Field Operations & Heat</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              {advisory.fieldwork_advisory}
            </p>
          </div>
        </div>

        {/* 2. 24-Hour Hourly Trend */}
        {hourly && hourly.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-agri-text">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-agri-primary" />
                24-Hour Microclimate Trend
              </span>
              <span className="text-[11px] text-agri-muted font-normal">3-hour intervals</span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {hourly.map((h, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-24 p-3 bg-agri-bg rounded-2xl border border-agri-border text-center space-y-1.5 shadow-sm"
                >
                  <span className="text-[11px] font-semibold text-agri-muted block">
                    {h.time}
                  </span>
                  <div className="flex justify-center my-1">
                    {getWeatherIcon(h.condition, h.rain_prob_pct)}
                  </div>
                  <span className="text-sm font-extrabold text-agri-text block">
                    {Math.round(h.temperature)}°C
                  </span>
                  <span
                    className={`text-[10px] font-bold block ${
                      h.rain_prob_pct >= 40 ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    {h.rain_prob_pct}% rain
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. 5-Day Daily Outlook */}
        {daily && daily.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-agri-text">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-agri-primary" />
                5-Day Precision Outlook
              </span>
            </div>

            <div className="space-y-2">
              {daily.map((d, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-2xl border border-agri-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-agri-bg flex items-center justify-center shrink-0">
                      {getWeatherIcon(d.condition, d.rain_prob_pct)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-agri-text">{d.day_name}</span>
                        <span className="text-xs text-agri-muted">({d.date})</span>
                        <Badge
                          variant={d.rain_prob_pct >= 50 ? "info" : "neutral"}
                          className="text-[10px] py-0"
                        >
                          {d.rain_prob_pct}% rain
                        </Badge>
                      </div>
                      <p className="text-xs text-emerald-800 mt-0.5">{d.advisory}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-center font-medium">
                    <span className="text-agri-muted">Humidity: {d.humidity_avg}%</span>
                    <div className="text-right">
                      <span className="font-extrabold text-agri-text text-sm">
                        {Math.round(d.temp_max)}°C
                      </span>
                      <span className="text-agri-muted text-xs ml-1">
                        / {Math.round(d.temp_min)}°C
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-agri-border">
          <Button variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
