"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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

interface ChecklistProps {
  taskId: string;
  checklists: ChecklistData[];
  onUpdate: () => void;
}

export function Checklist({ taskId, checklists, onUpdate }: ChecklistProps) {
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [newItemContent, setNewItemContent] = useState("");

  const handleAddChecklist = async () => {
    if (!newChecklistTitle.trim()) return;

    try {
      const response = await fetch("/api/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newChecklistTitle, taskId }),
      });

      if (response.ok) {
        setNewChecklistTitle("");
        setIsAddingChecklist(false);
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to add checklist:", error);
    }
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    if (!confirm("Delete this checklist?")) return;

    try {
      const response = await fetch(`/api/checklists/${checklistId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to delete checklist:", error);
    }
  };

  const handleAddItem = async (checklistId: string) => {
    if (!newItemContent.trim()) return;

    try {
      const response = await fetch("/api/checklist-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newItemContent, checklistId }),
      });

      if (response.ok) {
        setNewItemContent("");
        setAddingItemTo(null);
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    try {
      await fetch(`/api/checklist-items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });

      onUpdate();
    } catch (error) {
      console.error("Failed to toggle item:", error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/checklist-items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const getProgress = (checklist: ChecklistData) => {
    if (checklist.items.length === 0) return 0;
    const completed = checklist.items.filter((item) => item.completed).length;
    return Math.round((completed / checklist.items.length) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Checklists</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAddingChecklist(true)}
        >
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
          Add Checklist
        </Button>
      </div>

      {isAddingChecklist && (
        <div className="space-y-2 p-3 border rounded-lg">
          <Input
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            placeholder="Checklist title"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddChecklist();
              if (e.key === "Escape") {
                setIsAddingChecklist(false);
                setNewChecklistTitle("");
              }
            }}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddChecklist}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAddingChecklist(false);
                setNewChecklistTitle("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {checklists.map((checklist) => {
        const progress = getProgress(checklist);
        return (
          <div key={checklist.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{checklist.title}</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-500"
                onClick={() => handleDeleteChecklist(checklist.id)}
              >
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>

            {checklist.items.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{progress}%</span>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="space-y-1">
              {checklist.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 group py-1"
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) =>
                      handleToggleItem(item.id, checked as boolean)
                    }
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      item.completed && "line-through text-gray-400"
                    )}
                  >
                    {item.content}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => handleDeleteItem(item.id)}
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>

            {addingItemTo === checklist.id ? (
              <div className="flex gap-2">
                <Input
                  value={newItemContent}
                  onChange={(e) => setNewItemContent(e.target.value)}
                  placeholder="Add an item"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddItem(checklist.id);
                    if (e.key === "Escape") {
                      setAddingItemTo(null);
                      setNewItemContent("");
                    }
                  }}
                />
                <Button size="sm" onClick={() => handleAddItem(checklist.id)}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAddingItemTo(null);
                    setNewItemContent("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500"
                onClick={() => setAddingItemTo(checklist.id)}
              >
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
                Add item
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
