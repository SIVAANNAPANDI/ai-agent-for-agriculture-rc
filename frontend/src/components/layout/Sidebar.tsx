import React from "react";
import { NavLink } from "react-router-dom";
import {
  Sprout,
  Home,
  MapPin,
  CalendarDays,
  Bot,
  ScanLine,
  Store,
  Users,
  Building,
  Bell,
  Settings,
  User,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useLanguage } from "../../contexts/LanguageContext";

export const Sidebar: React.FC = () => {
  const { language } = useLanguage();

  const navItems = [
    { to: "/", label: language === "ta" ? "முகப்பு" : "Home", icon: Home },
    { to: "/farm", label: language === "ta" ? "எனது பண்ணை" : "My Farm", icon: MapPin },
    { to: "/calendar", label: language === "ta" ? "சாகுபடி நாள்காட்டி" : "Calendar", icon: CalendarDays },
    { to: "/ai-agent", label: language === "ta" ? "AI உதவியாளர்" : "AI Agent", icon: Bot, badge: "Nemotron" },
    { to: "/disease", label: language === "ta" ? "நோய் கண்டறிதல்" : "Disease Analysis", icon: ScanLine },
    { to: "/market", label: language === "ta" ? "விளைபொருள் அங்காடி" : "Local Shop", icon: Store },
    { to: "/labours", label: language === "ta" ? "தொழிலாளர்கள்" : "Labours", icon: Users },
    { to: "/rentals", label: language === "ta" ? "நில வாடகை" : "Rentals", icon: Building },
  ];

  const bottomItems = [
    { to: "/notifications", label: language === "ta" ? "அறிவிப்புகள்" : "Notifications", icon: Bell },
    { to: "/settings", label: language === "ta" ? "அமைப்புகள்" : "Settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-agri-border h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-agri-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-agri-primary flex items-center justify-center text-white shadow-md">
          <Sprout className="w-6 h-6 text-agri-primaryLight" />
        </div>
        <div>
          <h1 className="font-extrabold text-xl text-agri-text tracking-tight leading-tight">
            AgriAssist
          </h1>
          <p className="text-[11px] font-medium text-agri-muted leading-none mt-0.5">
            Smart Farm Decisions
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 group",
                  isActive
                    ? "bg-agri-primary text-white shadow-sm"
                    : "text-agri-muted hover:text-agri-text hover:bg-slate-100"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isActive
                          ? "text-agri-primaryLight"
                          : "text-slate-400 group-hover:text-agri-primary"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-emerald-800"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Utility Stack */}
      <div className="p-3 border-t border-agri-border space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-agri-primary text-white"
                    : "text-agri-muted hover:text-agri-text hover:bg-slate-100"
                )
              }
            >
              <Icon className="w-5 h-5 text-slate-400" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Small Profile Card */}
        <div className="pt-2">
          <NavLink
            to="/settings"
            className="flex items-center gap-3 p-2.5 rounded-xl bg-agri-bg border border-agri-border hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-agri-primary/10 border border-agri-primary/20 flex items-center justify-center text-agri-primary font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-agri-text block truncate">
                Farmer Profile
              </span>
              <span className="text-[10px] text-agri-muted block truncate">
                Manage Account
              </span>
            </div>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};
