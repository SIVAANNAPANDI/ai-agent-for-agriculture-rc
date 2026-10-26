import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { AlertCircle } from "lucide-react";
import type { CreateTaskPayload } from "../../services/cultivationService";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycleId: number;
  onAddTask: (cycleId: number, payload: CreateTaskPayload) => Promise<void>;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  cycleId,
  onAddTask,
}) => {
  const [stageName, setStageName] = useState<string>("Irrigation");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide a title for the task.");
      return;
    }
    if (!dueDate) {
      setError("Please specify the scheduled due date.");
      return;
    }

    try {
      setLoading(true);
      await onAddTask(cycleId, {
        stage_name: stageName,
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate,
      });
      setTitle("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add custom task.");
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { value: "Land Preparation", label: "Land Preparation & Basal" },
    { value: "Sowing", label: "Sowing / Seed Treatment" },
    { value: "Transplanting", label: "Transplanting & Establishment" },
    { value: "Irrigation", label: "Irrigation & Water Control" },
    { value: "Fertilization", label: "Fertigation & Micronutrients" },
    { value: "Weeding", label: "Weeding & Earthing Up" },
    { value: "Pest monitoring", label: "Pest Monitoring & Spraying" },
    { value: "Flowering", label: "Flowering & Fruit Setting" },
    { value: "Harvesting", label: "Harvesting & Post-Harvest" },
    { value: "General", label: "General Farm Operations" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Scheduled Farm Task"
      description="Add an agronomic task or maintenance reminder to this cultivation cycle."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Select
          label="Phenological Stage"
          value={stageName}
          onChange={(e) => setStageName(e.target.value)}
          options={stages}
        />

        <Input
          label="Task Title"
          placeholder="e.g. Apply neem oil foliar spray (5 ml/L)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label="Scheduled Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />

        <Input
          label="Detailed Description (Optional)"
          placeholder="e.g. Inspect lower leaves for aphid colonies before spraying"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-agri-border">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={loading}>
            Add Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
