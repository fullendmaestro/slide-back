import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { file, albumFile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Get all files for the current user
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get("albumId");

    let files;

    console.log("log 2");
    if (albumId) {
      // Get files for a specific album
      files = await db.query.albumFile.findMany({
        where: eq(albumFile.albumId, albumId),
        with: {
          file: true,
        },
      });

      // Extract just the file data
      files = files.map((af) => af.file);
      console.log("log 2");
    } else {
      // Get all files for the user
      files = await db.query.file.findMany({
        where: eq(file.userId, session.user.id),
        // orderBy: [file.dateCreated, "desc"],
      });
      console.log("returning files", files);
    }

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

// Delete a file
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Check if the file belongs to the user
    const fileToDelete = await db.query.file.findFirst({
      where: eq(file.id, fileId),
    });

    if (!fileToDelete) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (fileToDelete.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
