"use client";

import { useState } from "react";
import { DragDropContext, DropResult, Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

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

interface ColumnData {
  id: string;
  name: string;
  position: number;
  tasks: Task[];
}

interface KanbanBoardProps {
  columns: ColumnData[];
  onTaskClick: (taskId: string) => void;
  onAddTask: (columnId: string, title: string) => void;
  onTaskMove: (result: DropResult) => void;
}

const getColumnColor = (name: string) => {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    "Backlog": { bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-700" },
    "To Do": { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700" },
    "In Progress": { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700" },
    "Review": { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700" },
    "Done": { bg: "bg-green-50", border: "border-green-300", text: "text-green-700" },
  };
  return colors[name] || { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-700" };
};

export function KanbanBoard({
  columns,
  onTaskClick,
  onAddTask,
  onTaskMove,
}: KanbanBoardProps) {
  const [expandedColumnId, setExpandedColumnId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const sortedColumns = columns.sort((a, b) => a.position - b.position);
  const expandedColumn = sortedColumns.find(c => c.id === expandedColumnId);

  const handleAddTask = () => {
    if (newTaskTitle.trim() && expandedColumnId) {
      onAddTask(expandedColumnId, newTaskTitle.trim());
      setNewTaskTitle("");
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewTaskTitle("");
    }
  };

  const closeExpanded = () => {
    setExpandedColumnId(null);
    setIsAdding(false);
    setNewTaskTitle("");
  };

  return (
    <DragDropContext onDragEnd={onTaskMove}>
      <div className="h-full relative">
        {/* Block Grid Layout */}
        <div className={cn(
          "grid gap-4 h-full content-start transition-all duration-300",
          expandedColumnId && "blur-sm pointer-events-none"
        )}>
          {/* First Row - 3 columns */}
          <div className="grid grid-cols-3 gap-4">
            {sortedColumns.slice(0, 3).map((column) => {
              const colors = getColumnColor(column.name);
              return (
                <div
                  key={column.id}
                  onClick={() => setExpandedColumnId(column.id)}
                  className={cn(
                    "rounded-xl border-2 p-6 cursor-pointer transition-all duration-200",
                    "hover:shadow-lg hover:scale-[1.02] hover:border-opacity-100",
                    colors.bg,
                    colors.border,
                    "min-h-[180px] flex flex-col"
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={cn("text-xl font-bold", colors.text)}>
                      {column.name}
                    </h3>
                    <span className={cn(
                      "text-2xl font-bold",
                      colors.text
                    )}>
                      {column.tasks.length}
                    </span>
                  </div>
                  <div className="flex-1">
                    {column.tasks.length > 0 ? (
                      <div className="space-y-2">
                        {column.tasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className="text-sm text-gray-600 truncate bg-white/50 rounded px-2 py-1"
                          >
                            {task.title}
                          </div>
                        ))}
                        {column.tasks.length > 3 && (
                          <div className="text-xs text-gray-500 italic">
                            +{column.tasks.length - 3} more tasks
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No tasks</p>
                    )}
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Click to expand
                  </div>
                </div>
              );
            })}
          </div>

          {/* Second Row - 2 columns centered */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-start-1 col-span-1" />
            {sortedColumns.slice(3, 5).map((column) => {
              const colors = getColumnColor(column.name);
              return (
                <div
                  key={column.id}
                  onClick={() => setExpandedColumnId(column.id)}
                  className={cn(
                    "rounded-xl border-2 p-6 cursor-pointer transition-all duration-200",
                    "hover:shadow-lg hover:scale-[1.02] hover:border-opacity-100",
                    colors.bg,
                    colors.border,
                    "min-h-[180px] flex flex-col"
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={cn("text-xl font-bold", colors.text)}>
                      {column.name}
                    </h3>
                    <span className={cn(
                      "text-2xl font-bold",
                      colors.text
                    )}>
                      {column.tasks.length}
                    </span>
                  </div>
                  <div className="flex-1">
                    {column.tasks.length > 0 ? (
                      <div className="space-y-2">
                        {column.tasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className="text-sm text-gray-600 truncate bg-white/50 rounded px-2 py-1"
                          >
                            {task.title}
                          </div>
                        ))}
                        {column.tasks.length > 3 && (
                          <div className="text-xs text-gray-500 italic">
                            +{column.tasks.length - 3} more tasks
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No tasks</p>
                    )}
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Click to expand
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expanded Column Overlay */}
        {expandedColumn && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={closeExpanded}
            />

            {/* Expanded Panel */}
            <div className="fixed inset-4 md:inset-12 lg:inset-20 z-50 flex items-center justify-center">
              <div
                className={cn(
                  "w-full max-w-2xl max-h-full rounded-2xl shadow-2xl border-2 overflow-hidden flex flex-col",
                  getColumnColor(expandedColumn.name).bg,
                  getColumnColor(expandedColumn.name).border
                )}
              >
                {/* Header */}
                <div className="p-4 border-b bg-white/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className={cn(
                      "text-2xl font-bold",
                      getColumnColor(expandedColumn.name).text
                    )}>
                      {expandedColumn.name}
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                      {expandedColumn.tasks.length} tasks
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeExpanded}
                    className="rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Tasks */}
                <Droppable droppableId={expandedColumn.id}>
                  {(provided) => (
                    <ScrollArea className="flex-1 p-4">
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-2 min-h-[200px]"
                      >
                        {expandedColumn.tasks.map((task, index) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            onClick={() => {
                              closeExpanded();
                              onTaskClick(task.id);
                            }}
                          />
                        ))}
                        {provided.placeholder}
                        {expandedColumn.tasks.length === 0 && (
                          <p className="text-center text-gray-400 py-8">
                            No tasks in this column yet
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </Droppable>

                {/* Add Task */}
                <div className="p-4 border-t bg-white/50">
                  {isAdding ? (
                    <div className="space-y-2">
                      <Input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter task title..."
                        autoFocus
                        className="bg-white"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddTask}>
                          Add Task
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setIsAdding(false);
                            setNewTaskTitle("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsAdding(true)}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
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
                      Add a task
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DragDropContext>
  );
}
