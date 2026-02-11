"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

interface ListViewProps {
  columns: Column[];
  onTaskClick: (taskId: string) => void;
}

export function ListView({ columns, onTaskClick }: ListViewProps) {
  // Flatten all tasks from all columns
  const allTasks = columns.flatMap((column) =>
    column.tasks.map((task) => ({
      ...task,
      columnName: column.name,
      columnId: column.id,
    }))
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (columnName: string) => {
    const colors: Record<string, string> = {
      Backlog: "bg-gray-100 text-gray-800",
      "To Do": "bg-blue-100 text-blue-800",
      "In Progress": "bg-yellow-100 text-yellow-800",
      Review: "bg-purple-100 text-purple-800",
      Done: "bg-green-100 text-green-800",
    };
    return (
      <span
        className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          colors[columnName] || "bg-gray-100 text-gray-800"
        )}
      >
        {columnName}
      </span>
    );
  };

  const getChecklistProgress = (task: Task) => {
    const total = task.checklists.reduce((sum, cl) => sum + cl.items.length, 0);
    const completed = task.checklists.reduce(
      (sum, cl) => sum + cl.items.filter((item) => item.completed).length,
      0
    );
    return { total, completed };
  };

  if (allTasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No tasks yet. Add tasks using the Kanban board view.
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Progress</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allTasks.map((task) => {
            const { total, completed } = getChecklistProgress(task);
            const isOverdue =
              task.dueDate &&
              new Date(task.dueDate) < new Date() &&
              task.columnName !== "Done";

            return (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => onTaskClick(task.id)}
              >
                <TableCell>
                  <Checkbox
                    checked={task.columnName === "Done"}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{task.title}</p>
                    {task.taskLabels.length > 0 && (
                      <div className="flex gap-1">
                        {task.taskLabels.slice(0, 3).map(({ label }) => (
                          <span
                            key={label.id}
                            className="inline-block h-2 w-6 rounded-full"
                            style={{ backgroundColor: label.color }}
                            title={label.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(task.columnName)}</TableCell>
                <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                <TableCell>
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(task.assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.dueDate ? (
                    <span
                      className={cn(
                        "text-sm",
                        isOverdue && "text-red-500 font-medium"
                      )}
                    >
                      {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">No date</span>
                  )}
                </TableCell>
                <TableCell>
                  {total > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            completed === total ? "bg-green-500" : "bg-blue-500"
                          )}
                          style={{ width: `${(completed / total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {completed}/{total}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
