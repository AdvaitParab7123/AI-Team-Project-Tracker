"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/shared/create-project-dialog";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

interface Project {
  id: string;
  name: string;
  description: string | null;
  type: string;
  createdAt: string;
  owner: {
    name: string;
  };
  taskCount: number;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch projects");
      const raw = data.projects ?? data;
      const mapped: Project[] = raw.map((p: {
        id: string;
        name: string;
        description: string | null;
        type: string;
        createdAt: string;
        owner: { name: string };
        columns: { _count: { tasks: number } }[];
      }) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        type: p.type,
        createdAt: p.createdAt,
        owner: p.owner,
        taskCount: (p.columns ?? []).reduce((sum, col) => sum + col._count.tasks, 0),
      }));
      setProjects(mapped);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
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

  const getTotalTasks = (project: Project) => {
    return project.taskCount;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show onboarding wizard when user has no projects
  if (projects.length === 0) {
    return (
      <div className="p-8">
        <OnboardingWizard onComplete={fetchProjects} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome to the AI Adoption Team Project Tracker
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          title="Create a new project"
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
          New Project
        </Button>
      </div>

      <CreateProjectDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onProjectCreated={fetchProjects}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Total number of projects">
          <CardHeader className="pb-2">
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-4xl">{projects.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card title="Total tasks across all projects">
          <CardHeader className="pb-2">
            <CardDescription>Total Tasks</CardDescription>
            <CardTitle className="text-4xl">
              {projects.reduce((sum, p) => sum + getTotalTasks(p), 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card title="Projects with at least one task">
          <CardHeader className="pb-2">
            <CardDescription>Active Projects</CardDescription>
            <CardTitle className="text-4xl">
              {projects.filter((p) => getTotalTasks(p) > 0).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Projects
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const typeInfo = getTypeLabel(project.type);
          return (
            <Link key={project.id} href={`/project/${project.id}`} title="Click to open project board">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{getTotalTasks(project)} tasks</span>
                    <span>
                      Created{" "}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
