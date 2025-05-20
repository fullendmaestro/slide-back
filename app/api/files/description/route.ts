import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { file } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateEmbedding } from "@/lib/ai/embedding";

// Update file description and regenerate embedding
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId, description } = await request.json();

    if (!fileId || !description) {
      return NextResponse.json(
        { error: "File ID and description are required" },
        { status: 400 }
      );
    }

    // Check if the file belongs to the user
    const fileToUpdate = await db.query.file.findFirst({
      where: eq(file.id, fileId),
    });

    if (!fileToUpdate) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (fileToUpdate.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate new embedding for the updated description
    const embedding = await generateEmbedding(description);

    console.log("file description:", description);

    // Update the file
    const [updatedFile] = await db
      .update(file)
      .set({
        description,
        embedding: JSON.stringify(embedding),
        lastModified: new Date(),
      })
      .where(eq(file.id, fileId))
      .returning();

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error("Error updating file description:", error);
    return NextResponse.json(
      { error: "Failed to update file description" },
      { status: 500 }
    );
  }
}
