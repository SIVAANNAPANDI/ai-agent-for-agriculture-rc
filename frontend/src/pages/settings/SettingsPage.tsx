import React, { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { useAuth } from "../../contexts/AuthContext";
import {
  userService,
  type UserSettings,
  type FarmerProfileUpdate,
} from "../../services/userService";
import {
  User,
  Globe,
  Bell,
  Shield,
  MapPin,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Smartphone,
  Mail,
  Sprout,
  Calendar,
  Lock,
  Sparkles,
  Server,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export const SettingsPage: React.FC = () => {
  const { user, profile, logout, refreshProfile } = useAuth();
  const { language, setLanguage } = useLanguage();

  // Profile Form State
  const [profileForm, setProfileForm] = useState<FarmerProfileUpdate>({
    name: user?.name || "",
    phone: user?.phone || "",
    location_name: profile?.profile?.location_name || "",
    preferred_language: profile?.profile?.preferred_language || "en",
    experience_years: profile?.profile?.experience_years || 0,
    primary_crop_type: profile?.profile?.primary_crop_type || "Paddy & Turmeric",
  });

  // Settings State
  const [settings, setSettings] = useState<UserSettings>({
    language: "en",
    weather_alerts_enabled: true,
    task_reminders_enabled: true,
    market_alerts_enabled: true,
    theme_mode: "light",
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  // Status & Feedback
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Load user data & settings
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
        location_name: profile?.profile?.location_name || "",
        preferred_language: profile?.profile?.preferred_language || "en",
        experience_years: profile?.profile?.experience_years || 0,
        primary_crop_type: profile?.profile?.primary_crop_type || "Paddy & Turmeric",
      });
      if (profile?.profile?.preferred_language === "ta") {
        setLanguage("ta");
      }
    }

    const loadSettings = async () => {
      try {
        const s = await userService.getSettings();
        setSettings(s);
        if (s.language === "ta") {
          setLanguage("ta");
        }
      } catch (err) {
        console.error("Failed to load user settings:", err);
      }
    };
    loadSettings();
  }, [user, profile]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      await userService.updateProfile(profileForm);
      if (refreshProfile) {
        await refreshProfile();
      }
      setProfileSuccess(
        language === "ta"
          ? "உங்கள் விவசாயி சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!"
          : "Farmer profile updated successfully!"
      );
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setProfileError(
        err.response?.data?.message ||
          (language === "ta"
            ? "சுயவிவரத்தை புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
            : "Failed to update profile. Please try again.")
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Setting Toggle
  const handleToggleSetting = async (
    key: "weather_alerts_enabled" | "task_reminders_enabled" | "market_alerts_enabled"
  ) => {
    const updatedValue = !settings[key];
    const newSettings = { ...settings, [key]: updatedValue };
    setSettings(newSettings);

    try {
      await userService.updateSettings({ [key]: updatedValue });
    } catch (err) {
      console.error(`Failed to update setting ${key}:`, err);
      // Revert on error
      setSettings(settings);
    }
  };

  // Handle Language Change
  const handleSelectLanguage = async (newLang: "en" | "ta") => {
    setLanguage(newLang);
    setSettings((prev) => ({ ...prev, language: newLang }));
    setProfileForm((prev) => ({ ...prev, preferred_language: newLang }));

    try {
      await Promise.all([
        userService.updateSettings({ language: newLang }),
        userService.updateProfile({ preferred_language: newLang }),
      ]);
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (err) {
      console.error("Failed to update language:", err);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      setPasswordError(
        language === "ta"
          ? "புதிய கடவுச்சொற்கள் பொருந்தவில்லை."
          : "New passwords do not match."
      );
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordError(
        language === "ta"
          ? "கடவுச்சொல் குறைந்தது 6 எழுத்துகள் கொண்டிருக்க வேண்டும்."
          : "Password must be at least 6 characters long."
      );
      return;
    }

    setIsChangingPassword(true);
    try {
      await userService.changePassword(passwordForm);
      setPasswordSuccess(
        language === "ta"
          ? "கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது!"
          : "Password changed successfully!"
      );
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_new_password: "",
      });
    } catch (err: any) {
      console.error("Failed to change password:", err);
      setPasswordError(
        err.response?.data?.message ||
          (language === "ta"
            ? "தற்போதைய கடவுச்சொல் தவறானது."
            : "Current password is incorrect.")
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-text">
              {language === "ta" ? "அமைப்புகள் & சுயவிவரம்" : "Settings & Profile"}
            </h1>
            <Badge variant="primary" className="text-xs px-2 py-0.5">
              {user?.phone ? "Verified Account" : "Active"}
            </Badge>
          </div>
          <p className="text-sm text-agri-muted mt-1">
            {language === "ta"
              ? "விவசாயி விபரங்கள், தமிழ்/ஆங்கில மொழி விருப்பங்கள், மற்றும் பாதுகாப்பு மேலாண்மை."
              : "Manage farmer identity, regional bilingual settings, real-time alerts, and account security."}
          </p>
        </div>

        {/* Global Language Toggle Switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSelectLanguage(language === "en" ? "ta" : "en")}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-agri-border bg-white text-agri-text hover:bg-slate-50 transition shadow-sm"
          >
            {language === "en" ? "தமிழ்" : "English"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Farmer ID Card */}
        <div className="space-y-4">
          <Card variant="surface" className="text-center p-6 space-y-4 border border-slate-200">
            <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-agri-primary text-agri-primary flex items-center justify-center font-black text-2xl mx-auto shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : "🌾"}
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-agri-text">
                {user?.name || (language === "ta" ? "விவசாயி" : "Farmer")}
              </h3>
              <p className="text-xs text-agri-muted flex items-center justify-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-agri-primary" />
                {profile?.profile?.location_name || "Tamil Nadu, India"}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-left">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-agri-primary" />
                  {language === "ta" ? "அலைபேசி:" : "Phone:"}
                </span>
                <span className="font-semibold text-agri-text">{user?.phone || "N/A"}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  {language === "ta" ? "மின்னஞ்சல்:" : "Email:"}
                </span>
                <span className="font-semibold text-agri-text truncate max-w-[130px]">
                  {user?.email || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  {language === "ta" ? "அனுபவம்:" : "Experience:"}
                </span>
                <span className="font-semibold text-agri-text">
                  {profile?.profile?.experience_years || 0} {language === "ta" ? "ஆண்டுகள்" : "Years"}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-left space-y-1">
              <span className="text-emerald-800 font-bold block flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5" />
                {language === "ta" ? "முதன்மை பயிர்:" : "Primary Crop Focus:"}
              </span>
              <span className="text-agri-text font-semibold block">
                {profile?.profile?.primary_crop_type || "Paddy, Turmeric, Vegetables"}
              </span>
            </div>
          </Card>

          {/* System & Architecture Info */}
          <Card variant="surface" className="p-4 border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-agri-primary" />
              {language === "ta" ? "தொழில்நுட்ப நிலை" : "System Diagnostics"}
            </span>
            <div className="flex items-center justify-between text-slate-500">
              <span>Platform:</span>
              <span className="font-semibold text-agri-text">AgriAssist v1.0</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Database:</span>
              <span className="font-semibold text-emerald-700">MySQL 8.0 Active</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>AI Engine:</span>
              <span className="font-semibold text-agri-primary">Nemotron-3 + Vision</span>
            </div>
          </Card>

          {/* Logout Action */}
          <Button
            variant="danger"
            size="md"
            leftIcon={<LogOut className="w-4 h-4" />}
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full"
          >
            {language === "ta" ? "வெளியேறு (Logout)" : "Logout Account"}
          </Button>
        </div>

        {/* Right Columns: Settings Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Section 1: Regional & Language Preference */}
          <Card variant="surface" className="p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-agri-text flex items-center gap-2">
                <Globe className="w-5 h-5 text-agri-primary" />
                <span>{language === "ta" ? "மொழி விருப்பம்" : "Language & Regional Preferences"}</span>
              </h3>
              <Badge variant="outline" className="text-xs">
                Bilingual
              </Badge>
            </div>
            <p className="text-xs text-agri-muted">
              {language === "ta"
                ? "AgriAssist குரல் உதவியாளர், AI ஆலோசனைகள் மற்றும் முகப்புப் பக்கத்தின் மொழியை தேர்வு செய்யவும்."
                : "Select your preferred language for voice assistant STT/TTS, agronomic advisories, and marketplace listings."}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleSelectLanguage("en")}
                className={`p-4 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                  language === "en"
                    ? "border-agri-primary bg-emerald-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-agri-text">English</span>
                  {language === "en" && <CheckCircle2 className="w-4 h-4 text-agri-primary" />}
                </div>
                <span className="text-xs text-agri-muted mt-2">Indian English Dialect</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectLanguage("ta")}
                className={`p-4 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                  language === "ta"
                    ? "border-agri-primary bg-emerald-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-agri-text">தமிழ் (Tamil)</span>
                  {language === "ta" && <CheckCircle2 className="w-4 h-4 text-agri-primary" />}
                </div>
                <span className="text-xs text-agri-muted mt-2">தமிழ்நாடு வட்டார வழக்கு</span>
              </button>
            </div>
          </Card>

          {/* Section 2: Contact Information & Profile Edit */}
          <Card variant="surface" className="p-5 border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-agri-text flex items-center gap-2">
              <User className="w-5 h-5 text-agri-primary" />
              <span>{language === "ta" ? "விவசாயி விபரங்கள்" : "Farmer Profile & Identity"}</span>
            </h3>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-agri-text mb-1">
                    {language === "ta" ? "முழு பெயர் *" : "Farmer Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-agri-text mb-1">
                    {language === "ta" ? "அலைபேசி எண் *" : "Mobile Phone *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-agri-text mb-1">
                  {language === "ta" ? "இருப்பிடம் / மாவட்டம் *" : "Village & District *"}
                </label>
                <input
                  type="text"
                  value={profileForm.location_name || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, location_name: e.target.value })}
                  placeholder="e.g. Kangeyam, Tiruppur, Tamil Nadu"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-agri-text mb-1">
                    {language === "ta" ? "விவசாய அனுபவம் (ஆண்டுகள்)" : "Farming Experience (Years)"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="70"
                    value={profileForm.experience_years}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        experience_years: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-agri-text mb-1">
                    {language === "ta" ? "முதன்மை பயிர்" : "Primary Crop Focus"}
                  </label>
                  <input
                    type="text"
                    value={profileForm.primary_crop_type || ""}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, primary_crop_type: e.target.value })
                    }
                    placeholder="e.g. Paddy, Turmeric, Banana"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSavingProfile}
                >
                  {language === "ta" ? "சுயவிவரத்தை சேமிக்க" : "Save Profile Updates"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Section 3: Notification Alerts Toggles */}
          <Card variant="surface" className="p-5 border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-agri-text flex items-center gap-2">
              <Bell className="w-5 h-5 text-agri-primary" />
              <span>{language === "ta" ? "அறிவிப்பு விருப்பங்கள்" : "Notification & Advisory Channels"}</span>
            </h3>

            <div className="space-y-3 pt-1">
              {/* Weather Alert Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-0.5">
                  <span className="font-bold text-sm text-agri-text block">
                    {language === "ta" ? "நுண்-வானிலை எச்சரிக்கைகள்" : "Microclimate Weather Warnings"}
                  </span>
                  <span className="text-xs text-agri-muted block">
                    {language === "ta"
                      ? "மழைப்பொழிவு, தீவிர வெப்பம் மற்றும் உறைபனி முன்னறிவிப்பு விழிப்பூட்டல்கள்."
                      : "Instant alerts on unexpected heavy rain, high temperature, and spray conditions."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting("weather_alerts_enabled")}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ease-in-out ${
                    settings.weather_alerts_enabled ? "bg-agri-primary justify-end" : "bg-slate-300 justify-start"
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
                </button>
              </div>

              {/* Cultivation Stage Tasks Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-0.5">
                  <span className="font-bold text-sm text-agri-text block">
                    {language === "ta" ? "பயிர் வளர்ச்சி பணிகள் நினைவூட்டல்" : "Cultivation Stage Task Due Alerts"}
                  </span>
                  <span className="text-xs text-agri-muted block">
                    {language === "ta"
                      ? "உரமிடுதல், களை எடுத்தல் மற்றும் நீர் பாய்ச்சல் கால அட்டவணை நினைவூட்டல்கள்."
                      : "Reminders when fertigation, weeding, bio-pesticide, or harvest stages become active."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting("task_reminders_enabled")}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ease-in-out ${
                    settings.task_reminders_enabled ? "bg-agri-primary justify-end" : "bg-slate-300 justify-start"
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
                </button>
              </div>

              {/* Marketplace Inquiries Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-0.5">
                  <span className="font-bold text-sm text-agri-text block">
                    {language === "ta" ? "அங்காடி & குத்தகை விசாரணைகள்" : "Marketplace & Farmland Inquiries"}
                  </span>
                  <span className="text-xs text-agri-muted block">
                    {language === "ta"
                      ? "உங்கள் விளைபொருட்கள் மற்றும் நில வாடகை பதிவுகள் குறித்த அறிவிப்புகள்."
                      : "Notifications when prospective buyers or farmers view your produce or land listings."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting("market_alerts_enabled")}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ease-in-out ${
                    settings.market_alerts_enabled ? "bg-agri-primary justify-end" : "bg-slate-300 justify-start"
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
                </button>
              </div>
            </div>
          </Card>

          {/* Section 4: Security & Password */}
          <Card variant="surface" className="p-5 border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-agri-text flex items-center gap-2">
              <Shield className="w-5 h-5 text-agri-primary" />
              <span>{language === "ta" ? "பாதுகாப்பு & கடவுச்சொல்" : "Security & Password"}</span>
            </h3>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-agri-text mb-1">
                  {language === "ta" ? "தற்போதைய கடவுச்சொல் *" : "Current Password *"}
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.current_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, current_password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-agri-text mb-1">
                    {language === "ta" ? "புதிய கடவுச்சொல் *" : "New Password *"}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, new_password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-agri-text mb-1">
                    {language === "ta" ? "புதிய கடவுச்சொல்லை உறுதிப்படுத்துக *" : "Confirm New Password *"}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.confirm_new_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirm_new_password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  variant="outline"
                  size="md"
                  leftIcon={<Lock className="w-4 h-4" />}
                  isLoading={isChangingPassword}
                >
                  {language === "ta" ? "கடவுச்சொல்லை மாற்றுக" : "Update Password"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title={language === "ta" ? "வெளியேற உறுதிப்படுத்தவும்" : "Confirm Logout"}
      >
        <div className="space-y-4">
          <p className="text-sm text-agri-muted">
            {language === "ta"
              ? "AgriAssist கணக்கிலிருந்து வெளியேற விரும்புகிறீர்களா? உங்கள் பண்ணை தரவுகள் மற்றும் அறிவிப்புகள் பாதுகாப்பாக சேமிக்கப்படும்."
              : "Are you sure you want to log out of your AgriAssist account? Your farm metrics and notifications will be securely saved."}
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              {language === "ta" ? "ரத்து" : "Cancel"}
            </Button>
            <Button
              variant="danger"
              size="md"
              leftIcon={<LogOut className="w-4 h-4" />}
              onClick={() => {
                setIsLogoutModalOpen(false);
                logout();
              }}
            >
              {language === "ta" ? "வெளியேறு" : "Logout"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default SettingsPage;
