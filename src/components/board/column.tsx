"use client";

import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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

interface ColumnData {
  id: string;
  name: string;
  tasks: Task[];
}

interface ColumnProps {
  column: ColumnData;
  onTaskClick: (taskId: string) => void;
  onAddTask: (columnId: string, title: string) => void;
}

export function Column({ column, onTaskClick, onAddTask }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(column.id, newTaskTitle.trim());
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

  return (
    <div className="flex flex-col w-72 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
      {/* Column Header */}
      <div className="p-3 font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{column.name}</span>
          <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {column.tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks List */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <ScrollArea
            className={cn(
              "flex-1 px-2 pb-2",
              snapshot.isDraggingOver && "bg-gray-200 dark:bg-gray-700"
            )}
          >
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="min-h-[200px]"
            >
              {column.tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onClick={() => onTaskClick(task.id)}
                />
              ))}
              {provided.placeholder}
            </div>
          </ScrollArea>
        )}
      </Droppable>

      {/* Add Task */}
      <div className="p-2">
        {isAdding ? (
          <div className="space-y-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter task title..."
              autoFocus
              className="bg-white dark:bg-gray-900"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddTask}>
                Add
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
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
  );
}
