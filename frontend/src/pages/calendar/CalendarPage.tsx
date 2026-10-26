import React, { useState, useEffect, useCallback } from "react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StartCycleModal } from "../../components/calendar/StartCycleModal";
import { AddTaskModal } from "../../components/calendar/AddTaskModal";
import { Modal } from "../../components/ui/Modal";
import {
  cultivationService,
  type CultivationCycle,
  type CultivationTask,
  type CropOption,
  type CreateCyclePayload,
  type CreateTaskPayload,
} from "../../services/cultivationService";
import { farmService, type Farm } from "../../services/farmService";
import {
  Sprout,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarDays,
  Calendar,
  CheckSquare,
  Square,
  Trash2,
  RefreshCw,
  Layers,
  MapPin,
  Tractor,
} from "lucide-react";

export const CalendarPage: React.FC = () => {
  const [cycles, setCycles] = useState<CultivationCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [crops, setCrops] = useState<CropOption[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "completed" | "overdue">("all");

  // Modals
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [cycleToDelete, setCycleToDelete] = useState<CultivationCycle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [cyclesData, cropsData, farmsData] = await Promise.all([
        cultivationService.getCycles(),
        cultivationService.getCrops(),
        farmService.getFarms(),
      ]);
      setCycles(cyclesData);
      setCrops(cropsData);
      setFarms(farmsData);

      if (cyclesData.length > 0) {
        setSelectedCycleId((prev) =>
          prev && cyclesData.some((c) => c.id === prev) ? prev : cyclesData[0].id
        );
      } else {
        setSelectedCycleId(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load cultivation cycles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Active Cycle
  const activeCycle = cycles.find((c) => c.id === selectedCycleId) || cycles[0] || null;

  // Task Toggle
  const handleToggleTask = async (task: CultivationTask) => {
    const newStatus = task.status === "COMPLETED" ? "PLANNED" : "COMPLETED";
    try {
      await cultivationService.updateTask(task.id, { status: newStatus });
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to update task status.");
    }
  };

  // Start Cycle Handler
  const handleStartCycle = async (payload: CreateCyclePayload) => {
    await cultivationService.createCycle(payload);
    await loadData();
  };

  // Add Task Handler
  const handleAddTask = async (cycleId: number, payload: CreateTaskPayload) => {
    await cultivationService.addTask(cycleId, payload);
    await loadData();
  };

  // Delete Cycle Handler
  const handleDeleteCycle = async () => {
    if (!cycleToDelete) return;
    try {
      setIsDeleting(true);
      await cultivationService.deleteCycle(cycleToDelete.id);
      setCycleToDelete(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to delete cycle.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter Tasks
  const filteredTasks = (activeCycle?.tasks || []).filter((task) => {
    if (filterTab === "pending") return task.status === "PLANNED" || task.status === "IN_PROGRESS";
    if (filterTab === "completed") return task.status === "COMPLETED";
    if (filterTab === "overdue") return task.is_overdue || task.status === "OVERDUE";
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-text">
              Cultivation Calendar
            </h1>
            {cycles.length > 0 && (
              <Badge variant="success" className="text-xs">
                {cycles.length} {cycles.length === 1 ? "Active Cycle" : "Active Cycles"}
              </Badge>
            )}
          </div>
          <p className="text-sm text-agri-muted mt-1">
            Weather-aware crop phenology tracking, scheduled fertigation, and daily task management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="surface"
            size="md"
            onClick={loadData}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="border border-agri-border"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsStartModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Start Crop Cycle
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* Empty State: No Active Cycles */}
      {!loading && cycles.length === 0 && (
        <Card variant="surface" className="py-16 px-6 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-agri-primary/10 flex items-center justify-center text-agri-primary shadow-inner">
            <Sprout className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-agri-text">
              No Active Cultivation Cycles
            </h2>
            <p className="text-sm text-agri-muted max-w-md mx-auto leading-relaxed">
              Launch a crop cycle on one of your registered farm parcels. AgriAssist will automatically
              build an agronomic timeline with task alerts for basal fertilization, weeding,
              flowering sprays, and harvest picking.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsStartModalOpen(true)}
              leftIcon={<Plus className="w-5 h-5" />}
              className="shadow-lg shadow-agri-primary/20"
            >
              Start Cultivation Cycle
            </Button>
          </div>
        </Card>
      )}

      {/* Active Cycle View */}
      {!loading && activeCycle && (
        <div className="space-y-6">
          {/* Multiple Cycles Selector Bar */}
          {cycles.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-semibold text-agri-muted flex-shrink-0 uppercase tracking-wider mr-1">
                Active Cycles:
              </span>
              {cycles.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCycleId(c.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 border ${
                    selectedCycleId === c.id
                      ? "bg-agri-primary text-white border-agri-primary shadow-sm"
                      : "bg-white text-agri-text border-agri-border hover:bg-slate-50"
                  }`}
                >
                  <Sprout className="w-3.5 h-3.5" />
                  <span>
                    {c.crop_name} ({c.farm_name})
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      selectedCycleId === c.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c.progress_pct}%
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Phenology Progress Banner */}
          <Card variant="surface" className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-agri-border pb-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-agri-primary flex items-center justify-center text-xl shrink-0 font-bold shadow-sm">
                  🌱
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-bold text-agri-text">
                      {activeCycle.crop_name}{" "}
                      <span className="text-agri-muted font-normal">
                        ({activeCycle.crop_tamil_name})
                      </span>
                    </h2>
                    <Badge variant="primary" className="text-xs">
                      {activeCycle.current_stage}
                    </Badge>
                  </div>
                  <span className="text-xs text-agri-muted flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-agri-primary" />
                    {activeCycle.farm_name} • Started: {activeCycle.start_date} • Expected Harvest:{" "}
                    {activeCycle.expected_harvest_date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddTaskModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Add Task
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCycleToDelete(activeCycle)}
                  className="text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Phenology Progress Bar & Metrics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-agri-muted">
                  Day {activeCycle.days_elapsed} of {activeCycle.days_total}
                </span>
                <span className="text-agri-primary font-bold text-sm">
                  {activeCycle.progress_pct}% Completed ({activeCycle.days_remaining} Days Remaining)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-agri-primaryLight h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${activeCycle.progress_pct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-agri-bg rounded-2xl border border-agri-border">
                <span className="text-xs text-agri-muted block">Current Stage</span>
                <span className="text-sm font-bold text-agri-text mt-0.5 block truncate">
                  {activeCycle.current_stage}
                </span>
              </div>
              <div className="p-3 bg-agri-bg rounded-2xl border border-agri-border">
                <span className="text-xs text-agri-muted block">Tasks Completed</span>
                <span className="text-sm font-bold text-agri-text mt-0.5 block">
                  {activeCycle.tasks_completed_count} / {activeCycle.tasks_count}
                </span>
              </div>
              <div className="p-3 bg-agri-bg rounded-2xl border border-agri-border">
                <span className="text-xs text-agri-muted block">Target Yield</span>
                <span className="text-sm font-bold text-agri-text mt-0.5 block truncate">
                  {activeCycle.estimated_yield || "Standard"}
                </span>
              </div>
              <div className="p-3 bg-agri-bg rounded-2xl border border-agri-border">
                <span className="text-xs text-agri-muted block">Cycle Status</span>
                <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                  {activeCycle.status}
                </span>
              </div>
            </div>
          </Card>

          {/* Task Checklist Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-agri-text flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-agri-primary" />
                <span>Agronomic Lifecycle Checklist</span>
              </h3>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setFilterTab("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterTab === "all" ? "bg-white text-agri-text shadow-sm" : "text-agri-muted hover:text-agri-text"
                  }`}
                >
                  All ({activeCycle.tasks.length})
                </button>
                <button
                  onClick={() => setFilterTab("pending")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterTab === "pending" ? "bg-white text-agri-text shadow-sm" : "text-agri-muted hover:text-agri-text"
                  }`}
                >
                  Pending ({activeCycle.tasks_count - activeCycle.tasks_completed_count})
                </button>
                <button
                  onClick={() => setFilterTab("completed")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterTab === "completed" ? "bg-white text-agri-text shadow-sm" : "text-agri-muted hover:text-agri-text"
                  }`}
                >
                  Completed ({activeCycle.tasks_completed_count})
                </button>
                <button
                  onClick={() => setFilterTab("overdue")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterTab === "overdue" ? "bg-white text-agri-danger shadow-sm" : "text-agri-muted hover:text-agri-text"
                  }`}
                >
                  Overdue
                </button>
              </div>
            </div>

            {/* Task Cards List */}
            <div className="space-y-2.5">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-agri-border text-xs text-agri-muted">
                  No tasks found in this filter category.
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isDone = task.status === "COMPLETED";
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 shadow-sm ${
                        isDone
                          ? "bg-emerald-50/40 border-emerald-200/80"
                          : task.is_overdue
                          ? "bg-red-50/50 border-red-200"
                          : "bg-white border-agri-border hover:border-agri-primaryLight"
                      }`}
                    >
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="mt-0.5 text-slate-400 hover:text-agri-primary transition-colors flex-shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Square className="w-5 h-5 hover:text-agri-primary" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-bold ${
                              isDone ? "line-through text-slate-400" : "text-agri-text"
                            }`}
                          >
                            {task.title}
                          </span>
                          <Badge variant="neutral" className="text-[10px] py-0">
                            {task.stage_name}
                          </Badge>
                          {task.is_overdue && !isDone && (
                            <Badge variant="danger" className="text-[10px] py-0">
                              OVERDUE
                            </Badge>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-agri-muted leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {task.weather_note && (
                          <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5 mt-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{task.weather_note}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-agri-muted block">
                          Due: {task.due_date}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider block mt-0.5 ${
                            isDone
                              ? "text-emerald-700"
                              : task.is_overdue
                              ? "text-red-600"
                              : "text-amber-700"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Start Cycle Modal */}
      <StartCycleModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        farms={farms}
        crops={crops}
        onStartCycle={handleStartCycle}
      />

      {/* Add Task Modal */}
      {activeCycle && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          cycleId={activeCycle.id}
          onAddTask={handleAddTask}
        />
      )}

      {/* Delete Cycle Confirmation Modal */}
      <Modal
        isOpen={!!cycleToDelete}
        onClose={() => setCycleToDelete(null)}
        title="Delete Cultivation Cycle"
        description="Are you sure you want to delete this crop cycle?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Deleting the cultivation cycle for <strong>{cycleToDelete?.crop_name}</strong> will
            permanently delete all associated stage tasks and timeline records.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-agri-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setCycleToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={handleDeleteCycle}
              isLoading={isDeleting}
            >
              Delete Cycle
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
