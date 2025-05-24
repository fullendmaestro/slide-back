import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { album, albumFile, file } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm"; // Import inArray

// Add files to an album
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { albumId, fileIds } = await request.json();

    if (
      !albumId ||
      !fileIds ||
      !Array.isArray(fileIds) ||
      fileIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Album ID and file IDs are required" },
        { status: 400 }
      );
    }

    // Check if the album belongs to the user
    const albumToUpdate = await db.query.album.findFirst({
      where: eq(album.id, albumId),
    });

    if (!albumToUpdate) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    if (albumToUpdate.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if all files belong to the user
    const files = await db.query.file.findMany({
      where: and(eq(file.userId, session.user.id), inArray(file.id, fileIds)),
    });

    if (files.length !== fileIds.length) {
      return NextResponse.json(
        { error: "Some files not found or don't belong to you" },
        { status: 400 }
      );
    }

    // Add files to the album
    // First, check which files are already in the album
    const existingAlbumFiles = await db.query.albumFile.findMany({
      where: and(
        eq(albumFile.albumId, albumId),
        inArray(albumFile.fileId, fileIds)
      ),
    });

    // Get fileIds that are not already in the album
    const existingFileIds = new Set(existingAlbumFiles.map((af) => af.fileId));
    const albumFilesToInsert = fileIds
      .filter((fileId) => !existingFileIds.has(fileId))
      .map((fileId) => ({
        albumId,
        fileId,
      }));

    if (albumFilesToInsert.length > 0) {
      await db.insert(albumFile).values(albumFilesToInsert);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding files to album:", error);
    return NextResponse.json(
      { error: "Failed to add files to album" },
      { status: 500 }
    );
  }
}

// Remove files from an album
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { albumId, fileIds } = await request.json();

    if (
      !albumId ||
      !fileIds ||
      !Array.isArray(fileIds) ||
      fileIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Album ID and file IDs are required" },
        { status: 400 }
      );
    }

    // Check if the album belongs to the user
    const albumToUpdate = await db.query.album.findFirst({
      where: eq(album.id, albumId),
    });

    if (!albumToUpdate) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    if (albumToUpdate.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove files from the album
    await db
      .delete(albumFile)
      .where(
        and(eq(albumFile.albumId, albumId), inArray(albumFile.fileId, fileIds))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing files from album:", error);
    return NextResponse.json(
      { error: "Failed to remove files from album" },
      { status: 500 }
    );
  }
}
