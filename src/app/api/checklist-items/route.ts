import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST create a new checklist item
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, checklistId } = body;

    if (!content || !checklistId) {
      return NextResponse.json(
        { error: "Content and checklistId are required" },
        { status: 400 }
      );
    }

    // Get the highest position
    const lastItem = await prisma.checklistItem.findFirst({
      where: { checklistId },
      orderBy: { position: "desc" },
    });

    const position = lastItem ? lastItem.position + 1 : 0;

    const item = await prisma.checklistItem.create({
      data: {
        content,
        checklistId,
        position,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating checklist item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
