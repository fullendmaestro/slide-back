import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { file, albumFile } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get("albumId");
    const favorites = searchParams.get("favorites") === "true";

    let files: any = [];

    if (albumId) {
      // Get files from a specific album
      const albumFiles = await db.query.albumFile.findMany({
        where: eq(albumFile.albumId, albumId),
        with: {
          file: true,
        },
      });

      // Extract the files and filter by user ID
      files = albumFiles
        .map((af) => af.file)
        .filter((f) => f.userId === session?.user?.id);
    } else if (favorites) {
      // Get favorite files
      files = await db.query.file.findMany({
        where: and(eq(file.userId, session.user.id), eq(file.isFavorite, true)),
        orderBy: [desc(file.lastModified)],
      });
    } else {
      // Get all files
      files = await db.query.file.findMany({
        where: eq(file.userId, session.user.id),
        orderBy: [desc(file.lastModified)],
      });
    }

    // For each file, get its albums
    const filesWithAlbums = await Promise.all(
      files.map(async (f) => {
        const { embedding, ...fileWithoutEmbedding } = f; // Remove embedding
        const fileAlbums = await db.query.albumFile.findMany({
          where: eq(albumFile.fileId, f.id),
          with: {
            album: true,
          },
        });

        return {
          ...fileWithoutEmbedding,
          albums: fileAlbums.map((fa) => fa.album),
        };
      })
    );

    return NextResponse.json(filesWithAlbums);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
