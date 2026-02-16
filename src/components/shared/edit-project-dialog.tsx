"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ProjectData {
  id: string;
  name: string;
  description?: string | null;
  type: string;
}

interface EditProjectDialogProps {
  project: ProjectData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdated?: () => void;
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
  onProjectUpdated,
}: EditProjectDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "general",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        type: project.type,
      });
    }
  }, [project]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setSaving(true);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          type: formData.type,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update project");
      }
      onOpenChange(false);
      onProjectUpdated?.();
      toast.success("Project updated");
    } catch (error) {
      console.error("Failed to update project:", error);
      toast.error("Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">Project Name</Label>
              <Input
                id="edit-project-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Website Redesign, API Integration"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-description">Description</Label>
              <Textarea
                id="edit-project-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="What is this project about? What are the goals?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-type">Project Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="client">Client Project</SelectItem>
                  <SelectItem value="internal">Internal Product</SelectItem>
                  <SelectItem value="feature_request">
                    Feature Request
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
