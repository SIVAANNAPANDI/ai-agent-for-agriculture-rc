import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { farmService, type Farm } from "../../services/farmService";
import { weatherService, type WeatherForecast } from "../../services/weatherService";
import { WeatherHeroCard } from "../../components/weather/WeatherHeroCard";
import { ForecastModal } from "../../components/weather/ForecastModal";
import { FarmOverviewWidget } from "../../components/home/FarmOverviewWidget";
import { CultivationProgressWidget } from "../../components/home/CultivationProgressWidget";
import { QuickActionsHub } from "../../components/home/QuickActionsHub";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { FarmModal } from "../../components/farm/FarmModal";
import { userService } from "../../services/userService";
import { diseaseService, type DiseaseHistoryItem } from "../../services/diseaseService";
import { getImageUrl } from "../../utils/imageUrl";
import {
  Bot,
  ScanLine,
  ArrowRight,
  Plus,
  Sparkles,
  MapPin,
  Tractor,
  Layers,
  Search,
  ShieldCheck,
  Activity,
  Leaf,
} from "lucide-react";

export const HomePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [loadingFarms, setLoadingFarms] = useState<boolean>(true);
  const [isAddFarmOpen, setIsAddFarmOpen] = useState<boolean>(false);

  // Desired Weather Location State
  const defaultUserLocation = profile?.profile?.location_name || user?.location || "Erode";
  const [customLocation, setCustomLocation] = useState<string>(() => {
    return localStorage.getItem("agriassist_desired_location") || "";
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [locationInput, setLocationInput] = useState<string>("");

  // Weather state
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState<boolean>(false);

  // Active farm calculation
  const activeFarm = farms.find((f) => f.id === selectedFarmId) || farms[0] || null;

  // Disease Diagnostics recent scan state
  const [recentScan, setRecentScan] = useState<DiseaseHistoryItem | null>(null);

  useEffect(() => {
    const fetchRecentScan = async () => {
      try {
        const history = await diseaseService.getScanHistory(1);
        if (history && history.length > 0) {
          setRecentScan(history[0]);
        }
      } catch (err) {
        console.warn("Could not load recent disease scan:", err);
      }
    };
    fetchRecentScan();
  }, []);

  // Sync customLocation with profile or localStorage when profile loads
  useEffect(() => {
    const saved = localStorage.getItem("agriassist_desired_location");
    if (saved) {
      setCustomLocation(saved);
    } else if (defaultUserLocation && !customLocation) {
      setCustomLocation(defaultUserLocation);
    }
  }, [defaultUserLocation]);

  // Load farms on mount
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        setLoadingFarms(true);
        const data = await farmService.getFarms();
        setFarms(data);
        if (data.length > 0) {
          setSelectedFarmId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch farms on homepage:", err);
      } finally {
        setLoadingFarms(false);
      }
    };
    fetchFarms();
  }, []);

  // Fetch weather data for desired area or active farm
  const fetchWeather = useCallback(async (targetLocation?: string) => {
    try {
      setLoadingWeather(true);
      const savedLoc = localStorage.getItem("agriassist_desired_location");
      const loc = targetLocation || customLocation || savedLoc || defaultUserLocation || "Erode";

      // If user selected a specific desired location or has one stored, prioritize it
      if (targetLocation || customLocation || savedLoc) {
        const wData = await weatherService.getForecast(
          undefined,
          undefined,
          loc
        );
        setForecast(wData);
      } else if (activeFarm) {
        const wData = await weatherService.getFarmWeather(activeFarm.id);
        setForecast(wData);
      } else {
        const wData = await weatherService.getForecast(
          undefined,
          undefined,
          loc
        );
        setForecast(wData);
      }
    } catch (err) {
      console.error("Failed to fetch weather on homepage:", err);
    } finally {
      setLoadingWeather(false);
    }
  }, [activeFarm, customLocation, defaultUserLocation]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const handleApplyLocation = async (newLoc: string) => {
    if (!newLoc.trim()) return;
    const cleanLoc = newLoc.trim();
    setCustomLocation(cleanLoc);
    localStorage.setItem("agriassist_desired_location", cleanLoc);
    setIsLocationModalOpen(false);
    await fetchWeather(cleanLoc);
    try {
      await userService.updateProfile({ location_name: cleanLoc });
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (err) {
      console.error("Failed to update profile location:", err);
    }
  };

  // Time-aware localized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name ? user.name : language === "ta" ? "விவசாயி" : "Farmer";

    if (language === "ta") {
      let timeGreeting = "காலை வணக்கம்";
      if (hour >= 12 && hour < 17) timeGreeting = "மதிய வணக்கம்";
      else if (hour >= 17 || hour < 5) timeGreeting = "மாலை வணக்கம்";
      return `${timeGreeting}, ${name}!`;
    }

    let timeGreeting = "Good morning";
    if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
    else if (hour >= 17 || hour < 5) timeGreeting = "Good evening";
    return `${timeGreeting}, ${name}!`;
  };

  const currentDate = new Date().toLocaleDateString(language === "ta" ? "ta-IN" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. Welcoming Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-agri-primary uppercase tracking-widest block mb-1">
            {language === "ta" ? "AgriAssist விவசாய நுண்ணறிவு தளம்" : "AgriAssist Intelligence Platform"}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-agri-text tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-sm sm:text-base text-agri-muted mt-1">
            {language === "ta"
              ? `துல்லிய விவசாய வழிகாட்டுதல் & பண்ணை மேலாண்மை • ${currentDate}`
              : `Precision agriculture insights & farm management • ${currentDate}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {farms.length === 0 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAddFarmOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {language === "ta" ? "பண்ணையை சேர்க்க" : "Add Your Farm"}
            </Button>
          ) : (
            <Link to="/ai-agent">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Bot className="w-4 h-4 text-agri-primaryLight" />}
              >
                {language === "ta" ? "AI உதவியாளர்" : "Ask AI Agent"}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Farm Parcel Selector Bar (if multiple farms exist) */}
      {farms.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-agri-muted flex-shrink-0 uppercase tracking-wider mr-1">
            Active Farm:
          </span>
          {farms.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFarmId(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 border ${
                (activeFarm?.id || 0) === f.id
                  ? "bg-agri-primary text-white border-agri-primary shadow-sm"
                  : "bg-white text-agri-text border-agri-border hover:bg-slate-50"
              }`}
            >
              <MapPin className="w-3 h-3 opacity-80" />
              <span>{f.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* 2. Flagship Weather Microclimate & Decision Hero Card */}
      <WeatherHeroCard
        weather={forecast?.current}
        locationName={forecast?.location_name || customLocation || activeFarm?.location_name || defaultUserLocation}
        hasFarm={!!activeFarm}
        isLoading={loadingWeather}
        onRefresh={() => fetchWeather(customLocation)}
        onOpenForecast={() => setIsForecastModalOpen(true)}
        onChangeLocation={() => {
          setLocationInput(customLocation || defaultUserLocation);
          setIsLocationModalOpen(true);
        }}
      />

      {/* 3. Operational Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Farm Overview Card */}
        <FarmOverviewWidget
          farm={activeFarm}
          totalFarmsCount={farms.length}
        />

        {/* Cultivation Progress Card - Weather-aware priority task */}
        <CultivationProgressWidget
          cropName={activeFarm?.current_crop || (activeFarm ? "Tomato (Co-3)" : null)}
          stageName={activeFarm ? "Flowering Stage" : undefined}
          dayElapsed={activeFarm ? 42 : undefined}
          totalDays={activeFarm ? 90 : undefined}
          priorityTask={
            forecast?.current?.wind_speed && forecast.current.wind_speed >= 5.5
              ? (language === "ta"
                  ? `வானிலை எச்சரிக்கை: அதிக காற்று (${forecast.current.wind_speed} m/s) உள்ளதால் இலைவழி தெளிப்பதை தவிர்க்கவும்.`
                  : `Weather Alert: Postpone foliar spraying today due to high wind speed (${forecast.current.wind_speed} m/s).`)
              : forecast?.current?.rain_risk_pct && forecast.current.rain_risk_pct >= 50
              ? (language === "ta"
                  ? `வானிலை எச்சரிக்கை: மழை வாய்ப்பு (${forecast.current.rain_risk_pct}%) உள்ளதால் பாசனத்தை நிறுத்தவும்.`
                  : `Weather Alert: Defer scheduled irrigation today as rain is expected (${forecast.current.rain_risk_pct}% risk).`)
              : undefined
          }
        />

        {/* Plant Health & AI Disease Diagnostics */}
        <Card variant="surface" className="flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-agri-text">
                  {language === "ta" ? "பயிர் நலம்" : "Plant Health"}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <Badge variant="success" className="text-[11px] font-bold">
                {language === "ta" ? "15-வகை AI மாதிரி தயார்" : "15-Class AI Active"}
              </Badge>
            </div>

            {recentScan ? (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-agri-border space-y-2.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-agri-muted">
                    {language === "ta" ? "கடைசி பகுப்பாய்வு" : "Latest Diagnosis"}
                  </span>
                  <span className="text-[11px] font-semibold text-agri-muted">
                    {new Date(recentScan.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-100 border border-emerald-200 shrink-0 flex items-center justify-center">
                    {recentScan.image_url ? (
                      <img
                        src={getImageUrl(recentScan.image_url)}
                        alt="Leaf"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2316a34a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/><path d='M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'/></svg>";
                        }}
                      />
                    ) : (
                      <Leaf className="w-5 h-5 text-agri-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-agri-text truncate">
                      {recentScan.crop_name} — {recentScan.disease_name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-bold text-agri-primary">
                        {recentScan.confidence_pct}% {language === "ta" ? "துல்லியம்" : "confidence"}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        recentScan.is_healthy ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {recentScan.is_healthy ? "Healthy" : recentScan.severity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-xl bg-agri-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ScanLine className="w-6 h-6 text-agri-primaryLight" />
                </div>
                <div>
                  <span className="text-xs font-bold text-agri-primary block">
                    {language === "ta" ? "இலை நோய் பகுப்பாய்வு" : "Leaf Disease Diagnostics"}
                  </span>
                  <span className="text-xs text-agri-muted block leading-snug mt-0.5">
                    {language === "ta"
                      ? "15-வகை EfficientNetB0 ஆழ்ந்த நரம்பியல் வலைப்பின்னல்."
                      : "15-class EfficientNetB0 neural vision network."}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-agri-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-agri-primary shrink-0" />
                <span>
                  {language === "ta"
                    ? "ஆர்கானிக் & ரசாயன சிகிச்சை வழிகாட்டுதல்"
                    : "Instant Organic & Chemical Remedies"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-agri-muted">
                <Activity className="w-3.5 h-3.5 text-agri-primary shrink-0" />
                <span>
                  {language === "ta"
                    ? "பயிர்கள்: தக்காளி, உருளைக்கிழங்கு, குடைமிளகாய்"
                    : "Crops: Tomato, Potato, Bell Pepper"}
                </span>
              </div>
            </div>
          </div>
          <Link to="/disease" className="pt-2">
            <Button variant="primary" size="sm" className="w-full justify-between">
              <span>{language === "ta" ? "இலை நோய் கண்டறிதல்" : "Scan Plant Leaf"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* 4. Quick Actions Hub */}
      <QuickActionsHub />

      {/* 5-Day Forecast & Hourly Breakdown Modal */}
      <ForecastModal
        isOpen={isForecastModalOpen}
        onClose={() => setIsForecastModalOpen(false)}
        forecast={forecast}
      />

      {/* Add Farm Modal (accessible directly from home) */}
      <FarmModal
        isOpen={isAddFarmOpen}
        onClose={() => setIsAddFarmOpen(false)}
        onSave={async (payload) => {
          await farmService.createFarm(payload as any);
          const updated = await farmService.getFarms();
          setFarms(updated);
          if (updated.length > 0) setSelectedFarmId(updated[0].id);
        }}
      />

      {/* Change Desired Weather Location Modal */}
      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title={language === "ta" ? "வானிலை பகுதியை மாற்றவும்" : "Select Desired Weather Location"}
      >
        <div className="space-y-4">
          <p className="text-xs text-agri-muted">
            {language === "ta"
              ? "உங்கள் பண்ணை அல்லது விரும்பிய பகுதிக்கான நேரடி வானிலை தகவல்களைப் பெற பகுதியைத் தேர்வு செய்யவும்."
              : "Select or enter your desired agricultural district/town to fetch real-time microclimate intelligence."}
          </p>

          {/* Quick Select Tamil Nadu Agricultural Districts */}
          <div>
            <label className="block text-xs font-bold text-agri-text mb-2">
              {language === "ta" ? "முக்கிய விவசாய பகுதிகள்" : "Major Agricultural Districts"}
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Erode", ta: "ஈரோடு" },
                { name: "Coimbatore", ta: "கோவை" },
                { name: "Tirupur", ta: "திருப்பூர்" },
                { name: "Salem", ta: "சேலம்" },
                { name: "Namakkal", ta: "நாமக்கல்" },
                { name: "Karur", ta: "கரூர்" },
                { name: "Thanjavur", ta: "தஞ்சாவூர்" },
                { name: "Madurai", ta: "மதுரை" },
                { name: "Trichy", ta: "திருச்சி" },
                { name: "Dindigul", ta: "திண்டுக்கல்" },
                { name: "Theni", ta: "தேனி" },
                { name: "Kanyakumari", ta: "கன்னியாகுமரி" },
              ].map((d) => (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => {
                    setLocationInput(d.name);
                    handleApplyLocation(d.name);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    (customLocation || defaultUserLocation).toLowerCase().includes(d.name.toLowerCase())
                      ? "bg-agri-primary text-white border-agri-primary shadow-xs"
                      : "bg-slate-50 text-agri-text border-agri-border hover:bg-emerald-50 hover:border-emerald-300"
                  }`}
                >
                  {language === "ta" ? d.ta : d.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div className="pt-2 border-t border-agri-border">
            <label className="block text-xs font-bold text-agri-text mb-1.5">
              {language === "ta" ? "அல்லது வேறு பகுதியை தட்டச்சு செய்க" : "Or Enter Custom Town / Village"}
            </label>
            <div className="flex gap-2">
              <Input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder={language === "ta" ? "எ.கா: Erode, Perundurai..." : "e.g., Erode, Perundurai..."}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyLocation(locationInput);
                  }
                }}
              />
              <Button
                variant="primary"
                onClick={() => handleApplyLocation(locationInput)}
                disabled={!locationInput.trim()}
              >
                {language === "ta" ? "மாற்று" : "Apply"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
