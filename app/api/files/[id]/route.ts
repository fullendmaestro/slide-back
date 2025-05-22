import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { file } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// GET a single file by ID
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fileId = params.id;

    const result = await db
      .select()
      .from(file)
      .where(and(eq(file.id, fileId), eq(file.userId, session.user.id)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }
}

// Schema for updating a file
const UpdateFileSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
  dateCreated: z.coerce.date().optional(),
  lastModified: z.coerce.date().optional(),
});

// PATCH to update a file
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fileId = params.id;
    const body = await request.json();

    const validatedData = UpdateFileSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      );
    }

    // Check if file exists and belongs to user
    const existingFile = await db
      .select({ id: file.id })
      .from(file)
      .where(and(eq(file.id, fileId), eq(file.userId, session.user.id)))
      .limit(1);

    if (existingFile.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Update the file
    const updatedFile = await db
      .update(file)
      .set({
        ...validatedData.data,
        lastModified: new Date(),
      })
      .where(eq(file.id, fileId))
      .returning();

    return NextResponse.json(updatedFile[0]);
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: "Failed to update file" },
      { status: 500 }
    );
  }
}

// DELETE a file
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fileId = params.id;

    // Check if file exists and belongs to user
    const existingFile = await db
      .select({ id: file.id })
      .from(file)
      .where(and(eq(file.id, fileId), eq(file.userId, session.user.id)))
      .limit(1);

    if (existingFile.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete the file
    await db.delete(file).where(eq(file.id, fileId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
