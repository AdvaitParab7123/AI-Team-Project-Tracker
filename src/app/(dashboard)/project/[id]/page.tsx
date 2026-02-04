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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isToday, isThisWeek, isBefore, startOfDay } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  position: number;
  dueDate: string | null;
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

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleAddTask = async (columnId: string, title: string) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, columnId }),
      });

      if (response.ok) {
        fetchProject();
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleTaskMove = async (result: DropResult) => {
    if (!result.destination || !project) return;

    const { source, destination, draggableId } = result;

    // If dropped in the same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Optimistic update
    const newColumns = [...project.columns];
    const sourceColumn = newColumns.find((c) => c.id === source.droppableId);
    const destColumn = newColumns.find((c) => c.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const [movedTask] = sourceColumn.tasks.splice(source.index, 1);
    destColumn.tasks.splice(destination.index, 0, movedTask);

    // Update positions
    sourceColumn.tasks.forEach((task, index) => {
      task.position = index;
    });
    destColumn.tasks.forEach((task, index) => {
      task.position = index;
    });

    setProject({ ...project, columns: newColumns });

    // Prepare tasks for API update
    const tasksToUpdate = [
      ...sourceColumn.tasks.map((t, i) => ({
        id: t.id,
        columnId: sourceColumn.id,
        position: i,
      })),
    ];

    if (source.droppableId !== destination.droppableId) {
      tasksToUpdate.push(
        ...destColumn.tasks.map((t, i) => ({
          id: t.id,
          columnId: destColumn.id,
          position: i,
        }))
      );
    }

    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: tasksToUpdate }),
      });
    } catch (error) {
      console.error("Failed to update task positions:", error);
      fetchProject(); // Revert on error
    }
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
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
