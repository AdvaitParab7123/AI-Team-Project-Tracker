"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Checklist } from "./checklist";
import { Comments } from "./comments";
import { TimeTracking } from "./time-tracking";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

interface ChecklistItem {
  id: string;
  content: string;
  completed: boolean;
  position: number;
}

interface ChecklistData {
  id: string;
  title: string;
  position: number;
  items: ChecklistItem[];
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
}

interface LabelData {
  id: string;
  name: string;
  color: string;
}

interface TimeEntryData {
  id: string;
  hours: number;
  description: string | null;
  date: string;
  user: User;
}

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: string | null;
  estimatedHours: number | null;
  assignee: User | null;
  checklists: ChecklistData[];
  comments: Comment[];
  taskLabels: { label: LabelData }[];
  attachments: unknown[];
  timeEntries: TimeEntryData[];
  column: { project: { labels: LabelData[] } };
}

interface TaskModalProps {
  taskId: string;
  projectLabels: LabelData[];
  onClose: () => void;
  onUpdate: () => void;
}

export function TaskModal({ taskId, onClose, onUpdate }: TaskModalProps) {
  const [task, setTask] = useState<TaskData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [estimatedHours, setEstimatedHours] = useState<string>("");

  const fetchTask = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) {
        setTask(null);
        return;
      }
      const taskData = await res.json();
      setTask(taskData as TaskData);
      setTitle(taskData.title);
      setDescription(taskData.description || "");
      setPriority(taskData.priority);
      setDueDate(taskData.dueDate ? new Date(taskData.dueDate) : undefined);
      setAssigneeId(taskData.assignee?.id || null);
      setEstimatedHours(taskData.estimatedHours ? String(taskData.estimatedHours) : "");
    } catch (error) {
      console.error("Failed to fetch task:", error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const allUsers = await res.json();
        setUsers(allUsers);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {
    fetchTask();
    fetchUsers();
  }, [fetchTask]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          priority,
          dueDate: dueDate?.toISOString() || null,
          assigneeId,
          estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        }),
      });
      if (res.ok) {
        await fetchTask();
        onUpdate();
        toast.success("Task updated");
      }
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        onClose();
        onUpdate();
        toast.success("Task deleted");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!task) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <p className="text-center text-gray-500">Task not found</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="sr-only">Edit Task</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSave}
                  className="text-xl font-semibold border-none p-0 h-auto focus-visible:ring-0"
                  placeholder="Task title"
                />
              </div>

              {/* Labels */}
              {task.taskLabels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.taskLabels.map(({ label }) => (
                    <Badge
                      key={label.id}
                      style={{ backgroundColor: label.color }}
                      className="text-white"
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Metadata Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Assignee */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500" title="Person responsible for this task">Assignee</Label>
                  <Select
                    value={assigneeId || "unassigned"}
                    onValueChange={(value) => {
                      setAssigneeId(value === "unassigned" ? null : value);
                      setTimeout(handleSave, 100);
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue>
                        {assigneeId ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {getInitials(
                                  users.find((u) => u.id === assigneeId)?.name ||
                                    ""
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">
                              {users.find((u) => u.id === assigneeId)?.name}
                            </span>
                          </div>
                        ) : (
                          "Unassigned"
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500" title="Task urgency level">Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(value) => {
                      setPriority(value);
                      setTimeout(handleSave, 100);
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-500" />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          High
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500" title="When this task should be completed">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-9 w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        {dueDate ? format(dueDate, "MMM d, yyyy") : "Set date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => {
                          setDueDate(date);
                          setTimeout(handleSave, 100);
                        }}
                        initialFocus
                      />
                      {dueDate && (
                        <div className="p-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setDueDate(undefined);
                              setTimeout(handleSave, 100);
                            }}
                          >
                            Clear date
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Estimated Hours */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500" title="How many hours you expect this task to take">
                    Estimate (hrs)
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 4"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    onBlur={handleSave}
                    className="h-9"
                  />
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSave}
                  placeholder="Add a more detailed description..."
                  rows={4}
                />
              </div>

              <Separator />

              {/* Checklists */}
              <Checklist
                taskId={taskId}
                checklists={task.checklists}
                onUpdate={fetchTask}
              />

              <Separator />

              {/* Time Tracking */}
              <TimeTracking
                taskId={taskId}
                estimatedHours={task.estimatedHours}
                timeEntries={task.timeEntries}
                onUpdate={fetchTask}
              />

              <Separator />

              {/* Comments */}
              <Comments
                taskId={taskId}
                comments={task.comments}
                onUpdate={fetchTask}
              />

              <Separator />

              {/* Actions */}
              <div className="flex justify-between">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  title="Permanently delete this task"
                >
                  Delete Task
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} title="Save all changes">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
