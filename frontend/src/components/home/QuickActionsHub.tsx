import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import {
  Bot,
  ScanLine,
  Sprout,
  Calendar,
  Store,
  Users,
  Building,
  Tractor,
} from "lucide-react";

interface ActionItem {
  title: string;
  subtitle: string;
  to: string;
  icon: React.ReactNode;
  bgClass: string;
  textClass: string;
}

export const QuickActionsHub: React.FC = () => {
  const actions: ActionItem[] = [
    {
      title: "AI Agriculture Agent",
      subtitle: "Tamil + English Voice & Chat",
      to: "/ai-agent",
      icon: <Bot className="w-5 h-5" />,
      bgClass: "bg-emerald-100/80",
      textClass: "text-agri-primary",
    },
    {
      title: "Leaf Disease Scanner",
      subtitle: "Instant AI diagnostics",
      to: "/disease",
      icon: <ScanLine className="w-5 h-5" />,
      bgClass: "bg-red-100/80",
      textClass: "text-red-700",
    },
    {
      title: "Crop Recommendation",
      subtitle: "Soil & climate suitability",
      to: "/recommendations",
      icon: <Sprout className="w-5 h-5" />,
      bgClass: "bg-amber-100/80",
      textClass: "text-amber-800",
    },
    {
      title: "Cultivation Calendar",
      subtitle: "Phenology & daily tasks",
      to: "/calendar",
      icon: <Calendar className="w-5 h-5" />,
      bgClass: "bg-teal-100/80",
      textClass: "text-teal-700",
    },
    {
      title: "Local Produce Shop",
      subtitle: "Farmer-to-farmer trade",
      to: "/market",
      icon: <Store className="w-5 h-5" />,
      bgClass: "bg-lime-100/80",
      textClass: "text-lime-800",
    },
    {
      title: "Hire Farm Labour",
      subtitle: "Connect with verified workers",
      to: "/labours",
      icon: <Users className="w-5 h-5" />,
      bgClass: "bg-blue-100/80",
      textClass: "text-blue-700",
    },
    {
      title: "Farm Land Rentals",
      subtitle: "Lease machinery & plots",
      to: "/rentals",
      icon: <Building className="w-5 h-5" />,
      bgClass: "bg-orange-100/80",
      textClass: "text-orange-800",
    },
    {
      title: "Farm & Soil Setup",
      subtitle: "Acreage, GPS, NPK levels",
      to: "/farm",
      icon: <Tractor className="w-5 h-5" />,
      bgClass: "bg-purple-100/80",
      textClass: "text-purple-700",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-agri-text">
          Precision Farm Tools & Marketplaces
        </h3>
        <span className="text-xs text-agri-muted">
          All services active
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((act) => (
          <Link key={act.to} to={act.to} className="group">
            <Card
              variant="interactive"
              padding="md"
              className="h-full flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div
                  className={`w-11 h-11 rounded-2xl ${act.bgClass} ${act.textClass} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200 shadow-sm`}
                >
                  {act.icon}
                </div>
                <h4 className="font-bold text-sm text-agri-text group-hover:text-agri-primary transition-colors">
                  {act.title}
                </h4>
                <p className="text-xs text-agri-muted mt-1 leading-snug">
                  {act.subtitle}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
