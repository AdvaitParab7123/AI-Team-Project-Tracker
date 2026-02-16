import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { GET, POST } from "./route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = vi.mocked(auth);
const mockPrisma = vi.mocked(prisma);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/projects", () => {
  it("returns projects list when authenticated", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const mockProjects = [
      {
        id: "proj-1",
        name: "Test Project",
        type: "general",
        description: null,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: "user-1",
        owner: { id: "user-1", name: "Test", email: "test@test.com" },
        columns: [],
        _count: { columns: 0 },
      },
    ];

    mockPrisma.project.findMany.mockResolvedValue(mockProjects as never);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Test Project");
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});

describe("POST /api/projects", () => {
  it("creates a project with default columns", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const mockProject = {
      id: "proj-new",
      name: "New Project",
      description: null,
      type: "general",
      ownerId: "user-1",
      columns: [
        { id: "col-1", name: "Backlog", position: 0 },
        { id: "col-2", name: "To Do", position: 1 },
        { id: "col-3", name: "In Progress", position: 2 },
        { id: "col-4", name: "Review", position: 3 },
        { id: "col-5", name: "Done", position: 4 },
      ],
    };

    mockPrisma.project.create.mockResolvedValue(mockProject as never);

    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({ name: "New Project" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.name).toBe("New Project");
    expect(body.columns).toHaveLength(5);
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({ name: "Test" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 when name is missing", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({ description: "No name provided" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Project name is required");
  });
});
