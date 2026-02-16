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
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { POST, PUT } from "./route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = vi.mocked(auth);
const mockPrisma = vi.mocked(prisma);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/tasks", () => {
  it("creates a task in a column", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    mockPrisma.task.findFirst.mockResolvedValue(null as never);

    const mockTask = {
      id: "task-1",
      title: "New Task",
      description: null,
      priority: "medium",
      position: 0,
      columnId: "col-1",
      assignee: null,
      checklists: [],
      taskLabels: [],
      _count: { comments: 0, attachments: 0 },
    };

    mockPrisma.task.create.mockResolvedValue(mockTask as never);

    const request = new NextRequest("http://localhost:3000/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "New Task", columnId: "col-1" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.title).toBe("New Task");
    expect(body.position).toBe(0);
  });

  it("returns 400 when columnId is missing", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const request = new NextRequest("http://localhost:3000/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "No Column" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Title and column are required");
  });

  it("returns 400 when title is missing", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const request = new NextRequest("http://localhost:3000/api/tasks", {
      method: "POST",
      body: JSON.stringify({ columnId: "col-1" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Title and column are required");
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const request = new NextRequest("http://localhost:3000/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "Test", columnId: "col-1" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});

describe("PUT /api/tasks (batch reorder)", () => {
  it("batch-updates task positions", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    mockPrisma.$transaction.mockResolvedValue([
      { id: "task-1", position: 0, columnId: "col-1" },
      { id: "task-2", position: 1, columnId: "col-1" },
    ] as never);

    const request = new NextRequest("http://localhost:3000/api/tasks", {
      method: "PUT",
      body: JSON.stringify({
        tasks: [
          { id: "task-1", columnId: "col-1", position: 0 },
          { id: "task-2", columnId: "col-1", position: 1 },
        ],
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 400 when tasks array is missing", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const request = new NextRequest("http://localhost:3000/api/tasks", {
      method: "PUT",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Tasks array is required");
  });
});
