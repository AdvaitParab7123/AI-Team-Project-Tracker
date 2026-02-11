"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TaskLabel {
  label: {
    id: string;
    name: string;
    color: string;
  };
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
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
  taskLabels: TaskLabel[];
  timeEntries: {
    hours: number;
  }[];
  _count: {
    comments: number;
    attachments: number;
  };
}

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
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

  const totalChecklistItems = task.checklists.reduce(
    (sum, cl) => sum + cl.items.length,
    0
  );
  const completedChecklistItems = task.checklists.reduce(
    (sum, cl) => sum + cl.items.filter((item) => item.completed).length,
    0
  );

  const totalLoggedHours = task.timeEntries?.reduce(
    (sum, entry) => sum + entry.hours,
    0
  ) || 0;
  const hasTimeData = totalLoggedHours > 0 || task.estimatedHours;
  const isOverEstimate =
    task.estimatedHours && totalLoggedHours > task.estimatedHours;

  const formatHours = (h: number) => {
    if (h >= 1) {
      const whole = Math.floor(h);
      const minutes = Math.round((h - whole) * 60);
      return minutes > 0 ? `${whole}h${minutes}m` : `${whole}h`;
    }
    return `${Math.round(h * 60)}m`;
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.priority !== "low";

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
        >
          <Card
            className={cn(
              "cursor-pointer hover:shadow-md transition-shadow mb-2",
              snapshot.isDragging && "shadow-lg rotate-2"
            )}
          >
            <CardContent className="p-3 space-y-2">
              {/* Labels */}
              {task.taskLabels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.taskLabels.slice(0, 3).map(({ label }) => (
                    <div
                      key={label.id}
                      className="h-2 w-8 rounded-full"
                      style={{ backgroundColor: label.color }}
                      title={label.name}
                    />
                  ))}
                  {task.taskLabels.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{task.taskLabels.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Title */}
              <p className="text-sm font-medium">{task.title}</p>

              {/* Metadata Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Priority */}
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      getPriorityColor(task.priority)
                    )}
                    title={`${task.priority} priority`}
                  />

                  {/* Due Date */}
                  {task.dueDate && (
                    <span
                      className={cn(
                        "text-xs",
                        isOverdue ? "text-red-500 font-medium" : "text-gray-500"
                      )}
                    >
                      {new Date(task.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}

                  {/* Checklist Progress */}
                  {totalChecklistItems > 0 && (
                    <span
                      className={cn(
                        "text-xs flex items-center gap-1",
                        completedChecklistItems === totalChecklistItems
                          ? "text-green-600"
                          : "text-gray-500"
                      )}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      {completedChecklistItems}/{totalChecklistItems}
                    </span>
                  )}

                  {/* Time Tracking */}
                  {hasTimeData && (
                    <span
                      className={cn(
                        "text-xs flex items-center gap-1",
                        isOverEstimate
                          ? "text-red-500 font-medium"
                          : totalLoggedHours > 0
                          ? "text-blue-500"
                          : "text-gray-500"
                      )}
                      title={
                        task.estimatedHours
                          ? `${formatHours(totalLoggedHours)} logged / ${formatHours(task.estimatedHours)} estimated`
                          : `${formatHours(totalLoggedHours)} logged`
                      }
                    >
                      <svg
                        className="w-3 h-3"
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
                      {formatHours(totalLoggedHours)}
                      {task.estimatedHours
                        ? `/${formatHours(task.estimatedHours)}`
                        : ""}
                    </span>
                  )}

                  {/* Comments */}
                  {task._count.comments > 0 && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {task._count.comments}
                    </span>
                  )}

                  {/* Attachments */}
                  {task._count.attachments > 0 && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      {task._count.attachments}
                    </span>
                  )}
                </div>

                {/* Assignee */}
                {task.assignee && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                      {getInitials(task.assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
