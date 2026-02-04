import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST create a new task
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, columnId, priority, dueDate, assigneeId } = body;

    if (!title || !columnId) {
      return NextResponse.json(
        { error: "Title and column are required" },
        { status: 400 }
      );
    }

    // Get the highest position in the column
    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { position: "desc" },
    });

    const position = lastTask ? lastTask.position + 1 : 0;

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        columnId,
        position,
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        checklists: {
          include: {
            items: true,
          },
        },
        taskLabels: {
          include: {
            label: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT reorder tasks (batch update positions)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tasks } = body;

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Tasks array is required" },
        { status: 400 }
      );
    }

    // Update all tasks in a transaction
    await prisma.$transaction(
      tasks.map((task: { id: string; columnId: string; position: number }) =>
        prisma.task.update({
          where: { id: task.id },
          data: {
            columnId: task.columnId,
            position: task.position,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
