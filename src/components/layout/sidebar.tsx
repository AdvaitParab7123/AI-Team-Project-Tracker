"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateProjectDialog } from "@/components/shared/create-project-dialog";
import { EditProjectDialog } from "@/components/shared/edit-project-dialog";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  type: string;
  description?: string | null;
}

interface SidebarProps {
  projects: Project[];
  onProjectCreated?: () => void;
}

export function Sidebar({ projects, onProjectCreated }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "client":
        return "bg-blue-500";
      case "internal":
        return "bg-green-500";
      case "feature_request":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteProject) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${deleteProject.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      toast.success(`"${deleteProject.name}" deleted`);
      // If user is viewing the deleted project, navigate home
      if (pathname === `/project/${deleteProject.id}`) {
        router.push("/");
      }
      onProjectCreated?.();
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
      setDeleteProject(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-64 bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Project Tracker</h1>
        <p className="text-xs text-gray-400 mt-1">AI Adoption Team</p>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <Link href="/" title="Go to dashboard overview">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800",
                  pathname === "/" && "bg-gray-800 text-white"
                )}
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
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Projects Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Projects
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                onClick={() => setIsCreateOpen(true)}
                title="Create a new project"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </Button>
            </div>

            <CreateProjectDialog
              open={isCreateOpen}
              onOpenChange={setIsCreateOpen}
              onProjectCreated={onProjectCreated}
            />

            <EditProjectDialog
              project={editProject}
              open={!!editProject}
              onOpenChange={(open) => {
                if (!open) setEditProject(null);
              }}
              onProjectUpdated={onProjectCreated}
            />

            {/* Delete Confirmation */}
            <AlertDialog
              open={!!deleteProject}
              onOpenChange={(open) => {
                if (!open) setDeleteProject(null);
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{deleteProject?.name}&quot;?
                    This will permanently remove all tasks, columns, comments,
                    and data in this project. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteProject}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    {deleting ? "Deleting..." : "Delete Project"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="space-y-1">
              {projects.map((project) => (
                <div key={project.id} className="group relative flex items-center">
                  <Link
                    href={`/project/${project.id}`}
                    title={`Open ${project.name}`}
                    className="flex-1 min-w-0"
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 pr-8",
                        pathname === `/project/${project.id}` &&
                          "bg-gray-800 text-white"
                      )}
                    >
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full mr-2 shrink-0",
                          getTypeColor(project.type)
                        )}
                      />
                      <span className="truncate">{project.name}</span>
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 h-6 w-6 p-0 text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-gray-700 transition-opacity"
                        title="Project options"
                        onClick={(e) => e.preventDefault()}
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
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => setEditProject(project)}
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteProject(project)}
                        className="text-red-400 focus:text-red-400"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-gray-500 px-2 py-1">
                  No projects yet
                </p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              title="Account settings and sign out"
            >
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback className="bg-gray-700 text-white text-xs">
                  {session?.user?.name
                    ? getInitials(session.user.name)
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate">
                  {session?.user?.name ?? "User"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session?.user?.email ?? ""}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
