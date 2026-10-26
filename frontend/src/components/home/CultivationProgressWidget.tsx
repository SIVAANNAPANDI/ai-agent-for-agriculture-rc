import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Sprout, ArrowRight, Calendar, CheckSquare, Clock } from "lucide-react";

interface CultivationProgressWidgetProps {
  cropName?: string | null;
  stageName?: string;
  dayElapsed?: number;
  totalDays?: number;
  priorityTask?: string;
}

export const CultivationProgressWidget: React.FC<CultivationProgressWidgetProps> = ({
  cropName,
  stageName = "Flowering Stage",
  dayElapsed = 42,
  totalDays = 90,
  priorityTask = "Apply secondary drip potassium fertigation (2 kg/acre).",
}) => {
  const hasActiveCycle = !!cropName;
  const progressPercent = Math.min(Math.round((dayElapsed / totalDays) * 100), 100);

  if (!hasActiveCycle) {
    return (
      <Card variant="surface" className="flex flex-col justify-between h-full space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base text-agri-text flex items-center gap-2">
              <Sprout className="w-4 h-4 text-agri-primary" />
              <span>Cultivation Progress</span>
            </h3>
            <Badge variant="neutral">No Active Crop</Badge>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
            <p className="text-xs text-agri-muted leading-relaxed">
              No crop cycle currently active. Select a recommended crop based on your soil and season to generate a dynamic farming calendar.
            </p>
          </div>
        </div>
        <Link to="/recommendations" className="pt-2">
          <Button variant="secondary" size="sm" className="w-full justify-center" leftIcon={<Sprout className="w-4 h-4" />}>
            Recommend Best Crops
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card variant="surface" className="flex flex-col justify-between h-full space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-base text-agri-text">{cropName}</h3>
            <span className="text-xs text-agri-muted flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-agri-primary" />
              Day {dayElapsed} of {totalDays}
            </span>
          </div>
          <Badge variant="info">{stageName}</Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-agri-muted">Crop Phenology</span>
            <span className="text-agri-primary font-bold">{progressPercent}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-agri-primaryLight h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Priority Task for Today */}
        <div className="mt-4 p-3 bg-agri-bg rounded-2xl border border-agri-border/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-agri-text">
            <CheckSquare className="w-3.5 h-3.5 text-agri-primary" />
            <span>Today's Priority Task</span>
          </div>
          <p className="text-xs text-agri-muted leading-relaxed pl-5">
            {priorityTask}
          </p>
        </div>
      </div>

      <Link to="/calendar" className="pt-2">
        <Button variant="outline" size="sm" className="w-full justify-between">
          <span>View Cultivation Calendar</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </Card>
  );
};
