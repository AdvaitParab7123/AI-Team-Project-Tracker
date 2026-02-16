import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    task: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { GET, PUT, DELETE } from "./route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = vi.mocked(auth);
const mockPrisma = vi.mocked(prisma);

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/tasks/[id]", () => {
  it("returns task with full details", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const mockTask = {
      id: "task-1",
      title: "Test Task",
      description: "A test task",
      priority: "high",
      position: 0,
      dueDate: null,
      estimatedHours: 4,
      columnId: "col-1",
      assignee: { id: "user-1", name: "Test", email: "test@test.com", avatar: null },
      column: {
        project: {
          labels: [{ id: "lbl-1", name: "Bug", color: "#ff0000" }],
        },
      },
      checklists: [],
      comments: [],
      attachments: [],
      taskLabels: [],
      timeEntries: [
        {
          id: "te-1",
          hours: 2,
          description: "Initial work",
          date: new Date().toISOString(),
          user: { id: "user-1", name: "Test", email: "test@test.com", avatar: null },
        },
      ],
    };

    mockPrisma.task.findUnique.mockResolvedValue(mockTask as never);

    const request = new NextRequest("http://localhost:3000/api/tasks/task-1");
    const response = await GET(request, makeParams("task-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.title).toBe("Test Task");
    expect(body.estimatedHours).toBe(4);
    expect(body.timeEntries).toHaveLength(1);
  });

  it("returns 404 for missing task", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    mockPrisma.task.findUnique.mockResolvedValue(null as never);

    const request = new NextRequest(
      "http://localhost:3000/api/tasks/non-existent"
    );
    const response = await GET(request, makeParams("non-existent"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Task not found");
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const request = new NextRequest("http://localhost:3000/api/tasks/task-1");
    const response = await GET(request, makeParams("task-1"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});

describe("PUT /api/tasks/[id]", () => {
  it("updates task fields", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const updatedTask = {
      id: "task-1",
      title: "Updated Task",
      description: "Updated description",
      priority: "low",
      position: 0,
      dueDate: null,
      estimatedHours: 8,
      assignee: null,
      checklists: [],
      taskLabels: [],
      _count: { comments: 0, attachments: 0 },
    };

    mockPrisma.task.update.mockResolvedValue(updatedTask as never);

    const request = new NextRequest(
      "http://localhost:3000/api/tasks/task-1",
      {
        method: "PUT",
        body: JSON.stringify({
          title: "Updated Task",
          description: "Updated description",
          priority: "low",
          estimatedHours: "8",
        }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await PUT(request, makeParams("task-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.title).toBe("Updated Task");
    expect(body.estimatedHours).toBe(8);
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const request = new NextRequest(
      "http://localhost:3000/api/tasks/task-1",
      {
        method: "PUT",
        body: JSON.stringify({ title: "Updated" }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await PUT(request, makeParams("task-1"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});

describe("DELETE /api/tasks/[id]", () => {
  it("removes task", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    mockPrisma.task.delete.mockResolvedValue({ id: "task-1" } as never);

    const request = new NextRequest(
      "http://localhost:3000/api/tasks/task-1",
      { method: "DELETE" }
    );
    const response = await DELETE(request, makeParams("task-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const request = new NextRequest(
      "http://localhost:3000/api/tasks/task-1",
      { method: "DELETE" }
    );
    const response = await DELETE(request, makeParams("task-1"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});
