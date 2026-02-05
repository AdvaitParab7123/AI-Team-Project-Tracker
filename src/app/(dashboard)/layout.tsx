"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { getProjects } from "@/lib/demo-store";

interface Project {
  id: string;
  name: string;
  type: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refreshProjects();
  }, []);

  const refreshProjects = () => {
    const allProjects = getProjects();
    setProjects(allProjects.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
    })));
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar projects={projects} onProjectCreated={refreshProjects} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
