"use client";

import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Column } from "./column";

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

export function KanbanBoard({
  columns,
  onTaskClick,
  onAddTask,
  onTaskMove,
}: KanbanBoardProps) {
  return (
    <DragDropContext onDragEnd={onTaskMove}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {columns
          .sort((a, b) => a.position - b.position)
          .map((column) => (
            <Column
              key={column.id}
              column={column}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
            />
          ))}
      </div>
    </DragDropContext>
  );
}
