"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

interface TimeEntryData {
  id: string;
  hours: number;
  description: string | null;
  date: string;
  user: User;
}

interface TimeTrackingProps {
  taskId: string;
  estimatedHours: number | null;
  timeEntries: TimeEntryData[];
  onUpdate: () => void;
}

export function TimeTracking({
  taskId,
  estimatedHours,
  timeEntries,
  onUpdate,
}: TimeTrackingProps) {
  const [showForm, setShowForm] = useState(false);
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [submitting, setSubmitting] = useState(false);

  const totalLogged = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const progressPercent = estimatedHours
    ? Math.min((totalLogged / estimatedHours) * 100, 100)
    : 0;
  const isOverEstimate = estimatedHours ? totalLogged > estimatedHours : false;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatHours = (h: number) => {
    if (h >= 1) {
      const whole = Math.floor(h);
      const minutes = Math.round((h - whole) * 60);
      return minutes > 0 ? `${whole}h ${minutes}m` : `${whole}h`;
    }
    return `${Math.round(h * 60)}m`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || parseFloat(hours) <= 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          hours: parseFloat(hours),
          description: description || null,
          date,
        }),
      });

      if (!res.ok) throw new Error("Failed to log time");

      toast.success(`Logged ${formatHours(parseFloat(hours))}`);
      setHours("");
      setDescription("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      setShowForm(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to log time:", error);
      toast.error("Failed to log time");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      const res = await fetch(`/api/time-entries/${entryId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Time entry removed");
      onUpdate();
    } catch (error) {
      console.error("Failed to delete time entry:", error);
      toast.error("Failed to delete time entry");
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Time Tracking
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "Cancel" : "+ Log Time"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Log time spent on this task</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Progress Summary */}
        {(estimatedHours || totalLogged > 0) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-gray-600 dark:text-gray-400 cursor-help">
                    {formatHours(totalLogged)} logged
                    {estimatedHours
                      ? ` / ${formatHours(estimatedHours)} estimated`
                      : ""}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {estimatedHours
                      ? `${Math.round(progressPercent)}% of estimate used`
                      : "No estimate set — set one in the Estimate field above"}
                  </p>
                </TooltipContent>
              </Tooltip>
              {isOverEstimate && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-red-500 font-medium cursor-help">
                      Over by {formatHours(totalLogged - (estimatedHours || 0))}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Time logged exceeds the original estimate</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {estimatedHours && (
              <Progress
                value={progressPercent}
                className={`h-2 ${isOverEstimate ? "[&>div]:bg-red-500" : ""}`}
              />
            )}
          </div>
        )}

        {/* Log Time Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="space-y-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Hours *</Label>
                <Input
                  type="number"
                  step="0.25"
                  min="0.25"
                  placeholder="e.g. 1.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">
                What did you work on?
              </Label>
              <Input
                placeholder="e.g. Implemented API endpoints"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !hours}
              className="w-full"
            >
              {submitting ? "Logging..." : "Log Time"}
            </Button>
          </form>
        )}

        {/* Time Entries List */}
        {timeEntries.length > 0 && (
          <div className="space-y-2">
            {timeEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 rounded-md border bg-white dark:bg-gray-900 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarFallback className="text-xs">
                            {getInitials(entry.user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{entry.user.name}</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatHours(entry.hours)}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {format(new Date(entry.date), "MMM d")}
                      </span>
                    </div>
                    {entry.description && (
                      <p className="text-xs text-gray-500 truncate">
                        {entry.description}
                      </p>
                    )}
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 shrink-0"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete this time entry</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        )}

        {timeEntries.length === 0 && !showForm && (
          <p className="text-xs text-gray-400 text-center py-2">
            No time logged yet. Click &quot;+ Log Time&quot; to start tracking.
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}
