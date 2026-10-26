import React from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  CloudSun,
  Droplets,
  Wind,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sun,
  CloudRain,
  Calendar,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Waves,
  Gauge,
} from "lucide-react";
import type { WeatherCurrent } from "../../services/weatherService";

interface WeatherHeroCardProps {
  weather?: WeatherCurrent | null;
  locationName?: string;
  hasFarm?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
  onOpenForecast?: () => void;
  onChangeLocation?: () => void;
}

export const WeatherHeroCard: React.FC<WeatherHeroCardProps> = ({
  weather,
  locationName = "Regional Microclimate",
  hasFarm = true,
  isLoading = false,
  onRefresh,
  onOpenForecast,
  onChangeLocation,
}) => {
  const { language } = useLanguage();
  const isTa = language === "ta";

  const temperature = weather ? weather.temperature : 29;
  const feelsLike = weather ? weather.feels_like : 31;
  const condition = weather ? weather.condition : "Partly Cloudy";
  const humidity = weather ? weather.humidity : 67;
  const windSpeed = weather ? weather.wind_speed : 2.1;
  const rainRisk = weather ? weather.rain_risk_pct : 25;
  const source = weather ? weather.source : "live_openweather";

  // Derive explicit task directives based on live metrics if not present in advisory
  const humidityTaskText =
    (isTa ? weather?.advisory?.humidity_task_ta : weather?.advisory?.humidity_task) ||
    (humidity >= 80
      ? isTa
        ? `அதிக பூஞ்சை நோய் ஆபத்து (${humidity}% RH). இலைகளின் அடிப்பகுதியில் பூஞ்சை தாக்குதலை சோதிக்கவும், காற்றோட்டத்தை அதிகரிக்கவும்.`
        : `High fungal blight risk (${humidity}% RH). Inspect lower crop foliage for powdery/downy mildew and improve aeration.`
      : humidity < 45
      ? isTa
        ? `வறண்ட காற்று சூழல் (${humidity}% RH). நிலப்போர்வை (Mulch) இட்டு மாலையில் நீர் பாய்ச்சவும்.`
        : `Dry microclimate (${humidity}% RH). High moisture loss. Mulch crop beds and schedule evening drip watering.`
      : isTa
      ? `சீரான ஈரப்பதம் (${humidity}% RH). பயிர் வளர்ச்சிக்கு உகந்தது. களையெடுத்தல் மற்றும் நில வேலைகளை தாராளமாக செய்யலாம்.`
      : `Balanced relative humidity (${humidity}% RH). Optimal transpiration. Ideal for intercultural weeding and field operations.`);

  const windTaskText =
    (isTa ? weather?.advisory?.wind_task_ta : weather?.advisory?.wind_task) ||
    (windSpeed >= 5.5
      ? isTa
        ? `வேகமான காற்று (${windSpeed} m/s). மருந்து காற்றில் வீணாகும் என்பதால் இலைவழி மற்றும் பூச்சிக்கொல்லி தெளிப்பதை தவிர்க்கவும்.`
        : `Unsafe for spraying (${windSpeed} m/s exceeds 5.5 m/s drift limit). Postpone chemical spraying & drone flights.`
      : windSpeed < 2.5
      ? isTa
        ? `சிறந்த தெளிப்பு நேரம் (${windSpeed} m/s மிதமான காற்று). இலைவழி உரம் மற்றும் பூச்சிக்கொல்லி மருந்து தெளிக்க உகந்தது.`
        : `Optimal spray window (${windSpeed} m/s calm breeze). Excellent conditions for foliar bio-fertilizer and nutrient spraying.`
      : isTa
      ? `மிதமான காற்று (${windSpeed} m/s). தரைமட்ட தெளிப்பான்களை கொண்டு குறைந்த அழுத்தத்தில் தெளிக்கலாம்.`
      : `Moderate breeze (${windSpeed} m/s). Suitable for ground tractor spraying with drift-reducing nozzles.`);

  const rainTaskText =
    (isTa ? weather?.advisory?.rain_task_ta : weather?.advisory?.rain_task) ||
    (rainRisk >= 50
      ? isTa
        ? `மழை எச்சரிக்கை (${rainRisk}% வாய்ப்பு). சொட்டுநீர் பாசனத்தை நிறுத்தி, வயலில் தேங்கும் நீரை வெளியேற்ற வடிகால் வசதியை சரிபார்க்கவும்.`
        : `Irrigation shutdown & drainage alert (${rainRisk}% rain probability). Turn off drip valves and clear field drainage furrows.`
      : rainRisk >= 25
      ? isTa
        ? `லேசான மழை வாய்ப்பு (${rainRisk}%). வழக்கமான நீர் பாய்ச்சும் அளவை 50% குறைத்து, மண்ணின் ஈரப்பதத்தை சோதித்து நீர் பாய்ச்சவும்.`
        : `Cautious irrigation (${rainRisk}% rain chance). Reduce scheduled watering by 50% and probe root zone soil moisture.`
      : isTa
      ? `வழக்கமான பாசனம் தொடரலாம் (${rainRisk}% குறைந்த மழை வாய்ப்பு). திட்டமிட்ட சொட்டுநீர் பாசனத்தை தொடரவும்.`
      : `Routine irrigation active (${rainRisk}% low rain risk). Continue scheduled drip fertigation and routine crop maintenance.`);

  const advisorySummary =
    weather?.advisory?.actionable_summary ||
    (rainRisk >= 50
      ? isTa
        ? "இன்று மழை எதிர்பார்க்கப்படுகிறது. வயல் ஈரம் சோதித்து பாசனத்தை திட்டமிடவும்."
        : "Rain expected today. Defer scheduled drip/flood irrigation to avoid waterlogging."
      : windSpeed >= 5.5
      ? isTa
        ? "வேகமான காற்று வீசுகிறது. இலைவழி மருந்து தெளிப்பதை ஒத்திவைக்கவும்."
        : "High winds detected. Postpone chemical foliar spraying."
      : isTa
      ? "பயிர்ப் பாதுகாப்பு மற்றும் வழக்கமான பண்ணை வேலைகளுக்கு சாதகமான வானிலை."
      : "Weather conditions are optimal for general crop maintenance and field tasks.");

  const riskLevel = weather?.advisory?.risk_level || (rainRisk >= 60 || windSpeed >= 5.5 ? "moderate" : "low");
  const isHighRisk = riskLevel === "high" || riskLevel === "extreme";

  const getWeatherIcon = () => {
    if (rainRisk >= 50) return <CloudRain className="w-5 h-5 text-blue-300" />;
    if (temperature >= 32 && rainRisk < 20) return <Sun className="w-5 h-5 text-amber-300" />;
    return <CloudSun className="w-5 h-5 text-emerald-300" />;
  };

  return (
    <Card variant="hero" padding="lg" className="relative overflow-hidden shadow-xl">
      {/* Background ambient glow circles */}
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* 1. Header & Live Microclimate Overview */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="primary" className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
              {isTa ? "நேரடி பண்ணை வானிலை" : "Live Farm Microclimate"}
            </Badge>

            {/* Clickable Location with Change Action */}
            <button
              type="button"
              onClick={onChangeLocation}
              className="text-xs text-emerald-100 hover:text-white flex items-center gap-1.5 font-semibold bg-white/15 hover:bg-white/25 transition-all px-2.5 py-1 rounded-full border border-white/25 cursor-pointer shadow-xs active:scale-95"
              title={isTa ? "வானிலை இடத்தை மாற்ற கிளிக் செய்யவும்" : "Click to change your desired weather location"}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>{weather?.location_name || locationName}</span>
              <span className="text-[10px] text-emerald-100 bg-white/20 hover:bg-white/30 px-1.5 py-0.5 rounded-full font-medium ml-1">
                {isTa ? "மாற்ற" : "Change"}
              </span>
            </button>
            <span className="text-[10px] bg-white/10 text-emerald-200 border border-white/20 px-2 py-0.5 rounded-full font-medium">
              {source === "live_openweather"
                ? isTa ? "OpenWeather நேரலை" : "OpenWeather 2.5 Live"
                : source === "cached_openweather"
                ? isTa ? "30 நிமிட தற்காலிக சேமிப்பு" : "30-Min Microclimate Cache"
                : isTa ? "பிராந்திய மாதிரி" : "Regional Simulation"}
            </span>
            {!hasFarm && (
              <span className="text-[10px] bg-amber-400/25 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded-full font-medium">
                {isTa ? "இயல்பு நிலையம்" : "Default Station"}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-4 mt-1">
            <span className="text-5xl sm:text-6xl font-black tracking-tighter text-white">
              {Math.round(temperature)}°C
            </span>
            <div>
              <span className="text-lg font-bold block text-emerald-50">
                {condition}
              </span>
              <span className="text-xs text-emerald-200">
                {isTa ? `உணர்வது ${Math.round(feelsLike)}°C` : `Feels like ${Math.round(feelsLike)}°C`}
              </span>
            </div>
          </div>
        </div>

        {/* Microclimate Gauges & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center">
            <div className="px-2">
              <Droplets className="w-4 h-4 text-emerald-200 mx-auto mb-1 opacity-90" />
              <span className="text-[11px] sm:text-xs text-emerald-100/80 block">
                {isTa ? "ஈரப்பதம்" : "Humidity"}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white">{humidity}%</span>
            </div>
            <div className="px-2 border-x border-white/10">
              <Wind className="w-4 h-4 text-emerald-200 mx-auto mb-1 opacity-90" />
              <span className="text-[11px] sm:text-xs text-emerald-100/80 block">
                {isTa ? "காற்று" : "Wind"}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white">{windSpeed} m/s</span>
            </div>
            <div className="px-2">
              {getWeatherIcon()}
              <span className="text-[11px] sm:text-xs text-emerald-100/80 block">
                {isTa ? "மழை வாய்ப்பு" : "Rain Risk"}
              </span>
              <span
                className={`text-sm sm:text-base font-extrabold ${
                  rainRisk >= 50 ? "text-amber-300" : "text-emerald-100"
                }`}
              >
                {rainRisk}%
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2">
            {onOpenForecast && (
              <Button
                type="button"
                variant="surface"
                size="sm"
                onClick={onOpenForecast}
                leftIcon={<Calendar className="w-3.5 h-3.5 text-agri-primary" />}
                className="bg-white/90 hover:bg-white text-agri-text border-white/40 shadow-sm text-xs py-2 px-3 rounded-xl flex-1 sm:flex-none justify-center"
              >
                {isTa ? "5 நாள் முன்னறிவிப்பு" : "5-Day Forecast"}
              </Button>
            )}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                title={isTa ? "வானிலை புதுப்பிக்க" : "Refresh Weather Data"}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center border border-white/15"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. DEDICATED WEATHER-DEPENDENT FARM TASKS HUB */}
      <div className="mt-5 pt-4 border-t border-white/15">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            {isTa ? "வானிலை சார்ந்த விவசாயப் பணிகள்" : "Weather-Driven Farm Action Tasks"}
          </span>
          <span className="text-[11px] text-emerald-100/70 font-medium">
            {isTa ? "இடத்திற்கேற்ப தானியங்கி பணி வழிகாட்டுதல்" : "Tailored to desired location microclimate"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Humidity Task Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex flex-col justify-between hover:bg-white/15 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-300" />
                  {isTa ? "ஈரப்பதம் பணி" : "Humidity Task"}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  humidity >= 80
                    ? "bg-amber-400/30 text-amber-200 border border-amber-300/40"
                    : humidity < 45
                    ? "bg-orange-400/30 text-orange-200 border border-orange-300/40"
                    : "bg-emerald-400/25 text-emerald-100 border border-emerald-300/30"
                }`}>
                  {humidity >= 80
                    ? (isTa ? "பூஞ்சை கவனம்" : "Fungal Spore Risk")
                    : humidity < 45
                    ? (isTa ? "குறைந்த ஈரம்" : "Low Moisture")
                    : (isTa ? "சீரான நிலை" : "Optimal RH")}
                </span>
              </div>
              <p className="text-xs text-emerald-50 leading-relaxed font-normal">
                {humidityTaskText}
              </p>
            </div>
          </div>

          {/* Wind Task Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex flex-col justify-between hover:bg-white/15 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-teal-300" />
                  {isTa ? "காற்று வேக பணி" : "Wind Task"}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  windSpeed >= 5.5
                    ? "bg-rose-500/30 text-rose-200 border border-rose-400/40"
                    : windSpeed < 2.5
                    ? "bg-emerald-400/25 text-emerald-100 border border-emerald-300/30"
                    : "bg-teal-400/25 text-teal-100 border border-teal-300/30"
                }`}>
                  {windSpeed >= 5.5
                    ? (isTa ? "தெளிக்க வேண்டாம்" : "Do Not Spray")
                    : windSpeed < 2.5
                    ? (isTa ? "தெளிக்க சிறந்தது" : "Prime Spray Window")
                    : (isTa ? "மிதமான காற்று" : "Moderate Drift")}
                </span>
              </div>
              <p className="text-xs text-emerald-50 leading-relaxed font-normal">
                {windTaskText}
              </p>
            </div>
          </div>

          {/* Rain Task Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex flex-col justify-between hover:bg-white/15 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-300" />
                  {isTa ? "மழை / பாசன பணி" : "Rain & Irrigation Task"}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  rainRisk >= 50
                    ? "bg-blue-400/30 text-blue-200 border border-blue-300/40"
                    : rainRisk >= 25
                    ? "bg-amber-400/30 text-amber-200 border border-amber-300/40"
                    : "bg-emerald-400/25 text-emerald-100 border border-emerald-300/30"
                }`}>
                  {rainRisk >= 50
                    ? (isTa ? "பாசனம் நிறுத்து" : "Halt Irrigation")
                    : rainRisk >= 25
                    ? (isTa ? "கவன பாசனம்" : "Reduce Watering")
                    : (isTa ? "வழக்கமான பாசனம்" : "Routine Irrigation")}
                </span>
              </div>
              <p className="text-xs text-emerald-50 leading-relaxed font-normal">
                {rainTaskText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Decision Intelligence Summary Banner */}
      <div className="mt-4 pt-3 border-t border-white/15 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-50 leading-relaxed">
        {isHighRisk ? (
          <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
        )}
        <p>
          <strong className="text-white font-semibold">
            {isTa ? "வேளாண் நுண்ணறிவு சுருக்கம்: " : "Agricultural Advisory: "}
          </strong>
          {advisorySummary}
        </p>
      </div>
    </Card>
  );
};
