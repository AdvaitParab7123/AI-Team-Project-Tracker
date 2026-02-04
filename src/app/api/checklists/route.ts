import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST create a new checklist
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, taskId } = body;

    if (!title || !taskId) {
      return NextResponse.json(
        { error: "Title and taskId are required" },
        { status: 400 }
      );
    }

    // Get the highest position
    const lastChecklist = await prisma.checklist.findFirst({
      where: { taskId },
      orderBy: { position: "desc" },
    });

    const position = lastChecklist ? lastChecklist.position + 1 : 0;

    const checklist = await prisma.checklist.create({
      data: {
        title,
        taskId,
        position,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(checklist, { status: 201 });
  } catch (error) {
    console.error("Error creating checklist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
