"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface OnboardingWizardProps {
  onComplete: () => void;
}

const STEPS = [
  { id: 1, label: "Welcome" },
  { id: 2, label: "Create Project" },
  { id: 3, label: "Add Task" },
  { id: 4, label: "Assign" },
  { id: 5, label: "Done" },
];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Project data
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("internal");
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [todoColumnId, setTodoColumnId] = useState<string | null>(null);

  // Task data
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);

  // Assign data
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
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

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription || null,
          type: projectType,
        }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const project = await res.json();
      setCreatedProjectId(project.id);

      // Find the "To Do" column
      const projectRes = await fetch(`/api/projects/${project.id}`);
      if (projectRes.ok) {
        const fullProject = await projectRes.json();
        const todoCol = fullProject.columns?.find(
          (c: { name: string; id: string }) => c.name === "To Do"
        );
        if (todoCol) setTodoColumnId(todoCol.id);
      }

      toast.success("Project created!");
      setStep(3);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !todoColumnId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          columnId: todoColumnId,
          priority: taskPriority,
        }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const task = await res.json();
      setCreatedTaskId(task.id);
      toast.success("Task created!");
      setStep(4);
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async () => {
    if (!createdTaskId || !selectedUserId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${createdTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId: selectedUserId }),
      });
      if (!res.ok) throw new Error("Failed to assign task");
      toast.success("Task assigned!");
      setStep(5);
    } catch (error) {
      console.error("Failed to assign task:", error);
      toast.error("Failed to assign task");
    } finally {
      setLoading(false);
    }
  };

  const goToProject = () => {
    onComplete();
    if (createdProjectId) {
      router.push(`/project/${createdProjectId}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step > s.id
                    ? "bg-green-500 text-white"
                    : step === s.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                )}
              >
                {step > s.id ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  s.id
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-1.5",
                  step === s.id
                    ? "text-blue-600 font-medium"
                    : "text-gray-400"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-12 h-0.5 mx-2 mb-5",
                  step > s.id ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="shadow-lg">
        <CardContent className="p-8">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome to Project Tracker!
                </h2>
                <p className="text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">
                  This tool helps the AI Adoption Team track projects, tasks,
                  and who&apos;s working on what. Let&apos;s get you set up in under a
                  minute.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="text-2xl mb-1">1</div>
                  <p className="text-xs text-gray-500">Create a project</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="text-2xl mb-1">2</div>
                  <p className="text-xs text-gray-500">Add your first task</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="text-2xl mb-1">3</div>
                  <p className="text-xs text-gray-500">Assign it to someone</p>
                </div>
              </div>
              <Button size="lg" onClick={() => setStep(2)} className="mt-4">
                Get Started
              </Button>
            </div>
          )}

          {/* Step 2: Create Project */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create Your First Project
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  A project groups related tasks together. It comes with columns
                  like Backlog, To Do, In Progress, Review, and Done.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Name *</Label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Website Redesign, API Integration"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="What is this project about?"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project Type</Label>
                  <Select
                    value={projectType}
                    onValueChange={setProjectType}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={!projectName.trim() || loading}
                >
                  {loading ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Add Task */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Add Your First Task
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Tasks are the individual work items. This will be added to the
                  &quot;To Do&quot; column of your project.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Task Title *</Label>
                  <Input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Set up database, Design homepage"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={taskPriority}
                    onValueChange={setTaskPriority}
                  >
                    <SelectTrigger>
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
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" disabled>
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(5)}
                  >
                    Skip
                  </Button>
                  <Button
                    onClick={handleCreateTask}
                    disabled={!taskTitle.trim() || loading}
                  >
                    {loading ? "Creating..." : "Add Task"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Assign */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Assign the Task
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Who should work on &quot;{taskTitle}&quot;? Pick a team member below.
                </p>
              </div>
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                      selectedUserId === user.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {selectedUserId === user.id && (
                      <svg
                        className="w-5 h-5 text-blue-500 ml-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No team members found.
                  </p>
                )}
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" disabled>
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(5)}
                  >
                    Skip
                  </Button>
                  <Button
                    onClick={handleAssignTask}
                    disabled={!selectedUserId || loading}
                  >
                    {loading ? "Assigning..." : "Assign & Continue"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Done */}
          {step === 5 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  You&apos;re All Set!
                </h2>
                <p className="text-gray-500 mt-3 max-w-md mx-auto">
                  Your project is ready. You can now add more tasks, assign team
                  members, set due dates, track time, and much more.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left space-y-2 max-w-sm mx-auto">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quick tips:
                </p>
                <ul className="text-xs text-gray-500 space-y-1.5">
                  <li className="flex gap-2">
                    <span>--</span> Click a column block to expand it and manage tasks
                  </li>
                  <li className="flex gap-2">
                    <span>--</span> Click a task card to edit details, add checklists, log time
                  </li>
                  <li className="flex gap-2">
                    <span>--</span> Drag and drop tasks between columns to update status
                  </li>
                  <li className="flex gap-2">
                    <span>--</span> Use filters to find tasks by priority, assignee, or due date
                  </li>
                </ul>
              </div>
              <Button size="lg" onClick={goToProject}>
                Go to Your Project
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
