"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { DropResult } from "@hello-pangea/dnd";
import { KanbanBoard } from "@/components/board/kanban-board";
import { ListView } from "@/components/board/list-view";
import { Filters, FilterState } from "@/components/board/filters";
import { TaskModal } from "@/components/task/task-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { isToday, isThisWeek, isBefore, startOfDay } from "date-fns";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  position: number;
  dueDate: string | null;
  estimatedHours: number | null;
  assignee: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
  checklists: {
    items: {
      completed: boolean;
    }[];
  }[];
  taskLabels: {
    label: {
      id: string;
      name: string;
      color: string;
    };
  }[];
  timeEntries: {
    hours: number;
  }[];
  _count: {
    comments: number;
    attachments: number;
  };
}

interface Column {
  id: string;
  name: string;
  position: number;
  tasks: Task[];
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  type: string;
  columns: Column[];
  labels: {
    id: string;
    name: string;
    color: string;
  }[];
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    priority: null,
    assigneeId: null,
    dueDate: null,
  });
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickTaskColumnId, setQuickTaskColumnId] = useState<string>("");

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setProject(null);
          return;
        }
        throw new Error("Failed to fetch project");
      }
      const projectData = await res.json();
      setProject(projectData);
    } catch (error) {
      console.error("Failed to fetch project:", error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleAddTask = async (columnId: string, title: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, columnId }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      toast.success("Task created");
      await fetchProject();
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleQuickAddTask = async () => {
    const columnId = quickTaskColumnId || project?.columns.find(c => c.name === "To Do")?.id || project?.columns[0]?.id;
    if (!quickTaskTitle.trim() || !columnId) return;
    await handleAddTask(columnId, quickTaskTitle.trim());
    setQuickTaskTitle("");
    setQuickAddOpen(false);
  };

  const handleTaskMove = (result: DropResult) => {
    if (!result.destination || !project) return;

    const { source, destination, draggableId } = result;

    // If dropped in the same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Optimistic UI update
    const newColumns = project.columns.map((col) => {
      if (col.id === source.droppableId && col.id === destination.droppableId) {
        const tasks = [...col.tasks];
        const [removed] = tasks.splice(source.index, 1);
        tasks.splice(destination.index, 0, removed);
        return { ...col, tasks: tasks.map((t, i) => ({ ...t, position: i })) };
      }
      if (col.id === source.droppableId) {
        const tasks = [...col.tasks];
        const [removed] = tasks.splice(source.index, 1);
        return { ...col, tasks: tasks.map((t, i) => ({ ...t, position: i })) };
      }
      if (col.id === destination.droppableId) {
        const tasks = [...col.tasks];
        const movedTask = project.columns
          .find((c) => c.id === source.droppableId)
          ?.tasks.find((t) => t.id === draggableId);
        if (!movedTask) return col;
        tasks.splice(destination.index, 0, {
          ...movedTask,
          position: destination.index,
        });
        return {
          ...col,
          tasks: tasks.map((t, i) => ({ ...t, position: i })),
        };
      }
      return col;
    });

    setProject({ ...project, columns: newColumns });

    // Build tasksToUpdate for API
    const tasksToUpdate: { id: string; columnId: string; position: number }[] =
      [];
    const sourceColumn = newColumns.find((c) => c.id === source.droppableId);
    const destColumn = newColumns.find((c) => c.id === destination.droppableId);

    if (sourceColumn) {
      sourceColumn.tasks.forEach((t, i) => {
        tasksToUpdate.push({
          id: t.id,
          columnId: sourceColumn.id,
          position: i,
        });
      });
    }
    if (destColumn && destColumn.id !== sourceColumn?.id) {
      destColumn.tasks.forEach((t, i) => {
        tasksToUpdate.push({
          id: t.id,
          columnId: destColumn.id,
          position: i,
        });
      });
    }

    fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: tasksToUpdate }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to move task");
      })
      .catch(() => {
        fetchProject(); // Revert on error
      });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "client":
        return { label: "Client Project", variant: "default" as const };
      case "internal":
        return { label: "Internal", variant: "secondary" as const };
      case "feature_request":
        return { label: "Feature Request", variant: "outline" as const };
      default:
        return { label: "General", variant: "secondary" as const };
    }
  };

  // Filter tasks based on current filters
  const filterTasks = (tasks: Task[]): Task[] => {
    return tasks.filter((task) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !task.title.toLowerCase().includes(searchLower) &&
          !(task.description?.toLowerCase().includes(searchLower))
        ) {
          return false;
        }
      }

      // Priority filter
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      // Assignee filter
      if (filters.assigneeId) {
        if (filters.assigneeId === "unassigned") {
          if (task.assignee) return false;
        } else if (task.assignee?.id !== filters.assigneeId) {
          return false;
        }
      }

      // Due date filter
      if (filters.dueDate) {
        const today = startOfDay(new Date());
        const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;

        switch (filters.dueDate) {
          case "overdue":
            if (!taskDueDate || !isBefore(taskDueDate, today)) return false;
            break;
          case "today":
            if (!taskDueDate || !isToday(taskDueDate)) return false;
            break;
          case "this-week":
            if (!taskDueDate || !isThisWeek(taskDueDate)) return false;
            break;
          case "no-date":
            if (taskDueDate) return false;
            break;
        }
      }

      return true;
    });
  };

  // Get filtered columns
  const filteredColumns = project?.columns.map((column) => ({
    ...column,
    tasks: filterTasks(column.tasks),
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  const typeInfo = getTypeLabel(project.type);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b bg-white dark:bg-gray-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
              <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
            </div>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Popover open={quickAddOpen} onOpenChange={setQuickAddOpen}>
              <PopoverTrigger asChild>
                <Button size="sm" title="Quickly add a new task">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Task
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Quick Add Task</h4>
                  <Input
                    placeholder="Task title..."
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleQuickAddTask();
                      if (e.key === "Escape") setQuickAddOpen(false);
                    }}
                    autoFocus
                  />
                  <Select
                    value={quickTaskColumnId || project.columns.find(c => c.name === "To Do")?.id || project.columns[0]?.id || ""}
                    onValueChange={setQuickTaskColumnId}
                  >
                    <SelectTrigger className="h-9" title="Choose which column to add the task to">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {project.columns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setQuickAddOpen(false);
                        setQuickTaskTitle("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleQuickAddTask}
                      disabled={!quickTaskTitle.trim()}
                    >
                      Add Task
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" title="Switch between board and list views">
                  {viewMode === "kanban" ? "Board" : "List"} View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setViewMode("kanban")}>
                  Board View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode("list")}>
                  List View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filters */}
        <Filters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Board */}
      <div className="flex-1 p-6 overflow-hidden">
        {viewMode === "kanban" ? (
          <KanbanBoard
            columns={filteredColumns}
            onTaskClick={setSelectedTaskId}
            onAddTask={handleAddTask}
            onTaskMove={handleTaskMove}
          />
        ) : (
          <ListView
            columns={filteredColumns}
            onTaskClick={setSelectedTaskId}
          />
        )}
      </div>

      {/* Task Modal */}
      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          projectLabels={project.labels}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={fetchProject}
        />
      )}
    </div>
  );
}
