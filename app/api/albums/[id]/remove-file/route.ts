import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { albumFile } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await request.json();
    if (!fileId) {
      return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
    }

    // Remove the file from the album
    await db
      .delete(albumFile)
      .where(
        and(eq(albumFile.albumId, params.id), eq(albumFile.fileId, fileId))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing file from album:", error);
    return NextResponse.json(
      { error: "Failed to remove file from album" },
      { status: 500 }
    );
  }
}
