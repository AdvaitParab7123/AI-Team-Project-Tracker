import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    timeEntry: {
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

describe("GET /api/time-entries", () => {
  it("returns entries for a task", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const mockEntries = [
      {
        id: "te-1",
        hours: 2,
        description: "Working on feature",
        date: new Date().toISOString(),
        taskId: "task-1",
        userId: "user-1",
        user: { id: "user-1", name: "Test", email: "test@test.com", avatar: null },
      },
      {
        id: "te-2",
        hours: 1.5,
        description: "Code review",
        date: new Date().toISOString(),
        taskId: "task-1",
        userId: "user-1",
        user: { id: "user-1", name: "Test", email: "test@test.com", avatar: null },
      },
    ];

    mockPrisma.timeEntry.findMany.mockResolvedValue(mockEntries as never);

    const request = new NextRequest(
      "http://localhost:3000/api/time-entries?taskId=task-1"
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].hours).toBe(2);
  });

  it("returns 400 when taskId is missing", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const request = new NextRequest(
      "http://localhost:3000/api/time-entries"
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("taskId is required");
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const request = new NextRequest(
      "http://localhost:3000/api/time-entries?taskId=task-1"
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});

describe("POST /api/time-entries", () => {
  it("creates a time entry", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const mockEntry = {
      id: "te-new",
      hours: 3,
      description: "Implementing feature",
      date: new Date().toISOString(),
      taskId: "task-1",
      userId: "user-1",
      user: { id: "user-1", name: "Test", email: "test@test.com", avatar: null },
    };

    mockPrisma.timeEntry.create.mockResolvedValue(mockEntry as never);

    const request = new NextRequest(
      "http://localhost:3000/api/time-entries",
      {
        method: "POST",
        body: JSON.stringify({
          taskId: "task-1",
          hours: 3,
          description: "Implementing feature",
        }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.hours).toBe(3);
    expect(body.description).toBe("Implementing feature");
  });

  it("returns 400 for invalid hours (zero)", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const request = new NextRequest(
      "http://localhost:3000/api/time-entries",
      {
        method: "POST",
        body: JSON.stringify({
          taskId: "task-1",
          hours: 0,
        }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("taskId and a positive hours value are required");
  });

  it("returns 400 for negative hours", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const request = new NextRequest(
      "http://localhost:3000/api/time-entries",
      {
        method: "POST",
        body: JSON.stringify({
          taskId: "task-1",
          hours: -2,
        }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("taskId and a positive hours value are required");
  });

  it("returns 400 when taskId is missing", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
      expires: "",
    });

    const request = new NextRequest(
      "http://localhost:3000/api/time-entries",
      {
        method: "POST",
        body: JSON.stringify({
          hours: 2,
        }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("taskId and a positive hours value are required");
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const request = new NextRequest(
      "http://localhost:3000/api/time-entries",
      {
        method: "POST",
        body: JSON.stringify({
          taskId: "task-1",
          hours: 2,
        }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});
