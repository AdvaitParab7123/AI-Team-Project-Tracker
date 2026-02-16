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

describe("GET /api/projects/[id]", () => {
  it("returns project with all relations", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const mockProject = {
      id: "proj-1",
      name: "Test Project",
      type: "general",
      description: "A test project",
      archived: false,
      ownerId: "user-1",
      owner: { id: "user-1", name: "Test", email: "test@test.com" },
      columns: [
        {
          id: "col-1",
          name: "To Do",
          position: 0,
          tasks: [],
        },
      ],
      labels: [],
    };

    mockPrisma.project.findUnique.mockResolvedValue(mockProject as never);

    const request = new NextRequest(
      "http://localhost:3000/api/projects/proj-1"
    );
    const response = await GET(request, makeParams("proj-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.name).toBe("Test Project");
    expect(body.columns).toHaveLength(1);
  });

  it("returns 404 for non-existent project", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    mockPrisma.project.findUnique.mockResolvedValue(null as never);

    const request = new NextRequest(
      "http://localhost:3000/api/projects/non-existent"
    );
    const response = await GET(request, makeParams("non-existent"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Project not found");
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const request = new NextRequest(
      "http://localhost:3000/api/projects/proj-1"
    );
    const response = await GET(request, makeParams("proj-1"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});

describe("PUT /api/projects/[id]", () => {
  it("updates name, description, and type", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const updatedProject = {
      id: "proj-1",
      name: "Updated Name",
      description: "Updated description",
      type: "internal",
    };

    mockPrisma.project.update.mockResolvedValue(updatedProject as never);

    const request = new NextRequest(
      "http://localhost:3000/api/projects/proj-1",
      {
        method: "PUT",
        body: JSON.stringify({
          name: "Updated Name",
          description: "Updated description",
          type: "internal",
        }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await PUT(request, makeParams("proj-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.name).toBe("Updated Name");
    expect(body.type).toBe("internal");
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const request = new NextRequest(
      "http://localhost:3000/api/projects/proj-1",
      {
        method: "PUT",
        body: JSON.stringify({ name: "Test" }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await PUT(request, makeParams("proj-1"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});

describe("DELETE /api/projects/[id]", () => {
  it("removes project", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    mockPrisma.project.delete.mockResolvedValue({
      id: "proj-1",
    } as never);

    const request = new NextRequest(
      "http://localhost:3000/api/projects/proj-1",
      { method: "DELETE" }
    );
    const response = await DELETE(request, makeParams("proj-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const request = new NextRequest(
      "http://localhost:3000/api/projects/proj-1",
      { method: "DELETE" }
    );
    const response = await DELETE(request, makeParams("proj-1"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});
