import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Bot,
  ScanLine,
  Store,
  Menu,
  MapPin,
  CalendarDays,
  Users,
  Building,
  Settings,
  Bell,
  X,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useLanguage } from "../../contexts/LanguageContext";

export const BottomNav: React.FC = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { language } = useLanguage();

  const mainNav = [
    { to: "/", label: language === "ta" ? "முகப்பு" : "Home", icon: Home },
    { to: "/ai-agent", label: language === "ta" ? "AI" : "AI", icon: Bot },
    { to: "/disease", label: language === "ta" ? "நோய்" : "Disease", icon: ScanLine },
    { to: "/market", label: language === "ta" ? "அங்காடி" : "Shop", icon: Store },
  ];

  const moreNav = [
    {
      to: "/farm",
      label: language === "ta" ? "எனது பண்ணை" : "My Farm",
      icon: MapPin,
      desc: language === "ta" ? "நில பரப்பளவு & மண் பண்புகள்" : "Land area & soil attributes",
    },
    {
      to: "/calendar",
      label: language === "ta" ? "சாகுபடி நாள்காட்டி" : "Calendar",
      icon: CalendarDays,
      desc: language === "ta" ? "காலவரிசை & பணிகள்" : "Cultivation timeline & tasks",
    },
    {
      to: "/labours",
      label: language === "ta" ? "தொழிலாளர்கள்" : "Labours",
      icon: Users,
      desc: language === "ta" ? "பண்ணை வேலைக்கு ஆட்கள்" : "Hire skilled farm workers",
    },
    {
      to: "/rentals",
      label: language === "ta" ? "நில வாடகை" : "Rentals",
      icon: Building,
      desc: language === "ta" ? "விவசாய நில குத்தகை" : "Farmland & equipment leases",
    },
    {
      to: "/notifications",
      label: language === "ta" ? "அறிவிப்புகள்" : "Notifications",
      icon: Bell,
      desc: language === "ta" ? "வானிலை & எச்சரிக்கைகள்" : "Weather & farm alerts",
    },
    {
      to: "/settings",
      label: language === "ta" ? "அமைப்புகள்" : "Settings",
      icon: Settings,
      desc: language === "ta" ? "மொழி & சுயவிவரம்" : "Language & profile details",
    },
  ];

  return (
    <>
      {/* "More" Drawer for Mobile */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl shadow-modal border-t border-agri-border p-5 z-50 animate-in slide-in-from-bottom duration-200 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-agri-border">
              <h3 className="font-bold text-base text-agri-text">All Modules</h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-3">
              {moreNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMoreOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col p-3 rounded-2xl border transition-all text-left",
                        isActive
                          ? "bg-agri-primary/10 border-agri-primary text-agri-primary"
                          : "bg-agri-bg border-agri-border text-agri-text hover:bg-slate-100"
                      )
                    }
                  >
                    <Icon className="w-5 h-5 text-agri-primary mb-1.5" />
                    <span className="font-bold text-sm leading-tight">{item.label}</span>
                    <span className="text-[11px] text-agri-muted leading-tight mt-0.5">
                      {item.desc}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-agri-border shadow-lg px-2 py-1.5">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mainNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all",
                    isActive
                      ? "text-agri-primary font-bold"
                      : "text-agri-muted hover:text-agri-text font-medium"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        "p-1 rounded-lg transition-transform",
                        isActive ? "bg-agri-primary/10 scale-110" : ""
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] mt-0.5">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}

          {/* More Button */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all",
              isMoreOpen
                ? "text-agri-primary font-bold"
                : "text-agri-muted hover:text-agri-text font-medium"
            )}
          >
            <div
              className={cn(
                "p-1 rounded-lg transition-transform",
                isMoreOpen ? "bg-agri-primary/10 scale-110" : ""
              )}
            >
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
