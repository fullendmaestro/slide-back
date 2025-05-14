import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { file } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isFavorite } = await request.json();

    if (typeof isFavorite !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Check if the file exists and belongs to the user
    const fileToUpdate = await db.query.file.findFirst({
      where: eq(file.id, params.id),
    });

    if (!fileToUpdate) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (fileToUpdate.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the file
    const [updatedFile] = await db
      .update(file)
      .set({
        isFavorite,
        lastModified: new Date(),
      })
      .where(eq(file.id, params.id))
      .returning();

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error("Error updating favorite status:", error);
    return NextResponse.json(
      { error: "Failed to update favorite status" },
      { status: 500 }
    );
  }
}
