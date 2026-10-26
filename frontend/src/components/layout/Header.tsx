import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, Bell, Globe, User, LogOut, Mic } from "lucide-react";

interface HeaderProps {
  userName?: string;
  farmName?: string;
  preferredLanguage?: "en" | "ta";
  onToggleLanguage?: () => void;
  unreadNotifications?: number;
  onLogout?: () => void;
  onOpenVoice?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = "Farmer",
  farmName = "My Farm",
  preferredLanguage = "en",
  onToggleLanguage,
  unreadNotifications = 0,
  onLogout,
  onOpenVoice,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-agri-border px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Mobile Brand / Desktop Context */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 md:hidden">
            <div className="w-10 h-10 rounded-xl bg-agri-primary flex items-center justify-center text-white shadow-sm">
              <Sprout className="w-6 h-6 text-agri-primaryLight" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-agri-text tracking-tight block leading-tight">
                AgriAssist
              </span>
              <span className="text-[11px] font-medium text-agri-muted block leading-none">
                {farmName}
              </span>
            </div>
          </Link>

          {/* Desktop breadcrumb / farm tag */}
          <div className="hidden md:flex items-center gap-2 text-sm text-agri-muted">
            <span className="font-medium text-agri-text">{farmName}</span>
            <span>•</span>
            <span className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
              Active Season
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Voice Assistant Quick Mic */}
          <button
            type="button"
            onClick={onOpenVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-agri-primary transition-all shadow-xs"
            title="Voice Assistant (Tamil & English)"
          >
            <Mic className="w-3.5 h-3.5 text-agri-primary animate-pulse" />
            <span className="hidden sm:inline">Voice Assistant</span>
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-agri-border text-xs font-semibold text-agri-text hover:bg-slate-50 transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-agri-primary" />
            <span>{preferredLanguage === "en" ? "தமிழ்" : "English"}</span>
          </button>

          {/* Notification Bell */}
          <Link
            to="/notifications"
            className="relative p-2.5 text-agri-text hover:text-agri-primary rounded-xl hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-agri-danger rounded-full ring-2 ring-white" />
            )}
          </Link>

          {/* Profile Avatar / Quick Nav */}
          <Link
            to="/settings"
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-agri-primary/10 border border-agri-primary/20 flex items-center justify-center text-agri-primary font-bold text-sm">
              {userName.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-agri-text">
              {userName}
            </span>
          </Link>

          {/* Logout (if authenticated) */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2.5 text-slate-400 hover:text-agri-danger rounded-xl hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
