import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { album, albumFile } from "@/lib/db/schema"; // <-- import albumFile join table
import { asc, eq, sql, inArray } from "drizzle-orm";

// Get all albums for the current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch albums and count items in each album
    const albums = await db.query.album.findMany({
      where: eq(album.userId, session.user.id),
      orderBy: [asc(album.name)],
    });

    // Get item counts for each album
    const albumIds = albums.map((a) => a.id);
    const itemCounts: Record<string, number> = {};
    if (albumIds.length > 0) {
      const counts = await db
        .select({ albumId: albumFile.albumId, count: sql<number>`COUNT(*)` })
        .from(albumFile)
        .where(inArray(albumFile.albumId, albumIds))
        .groupBy(albumFile.albumId);

      counts.forEach((row: { albumId: string; count: number }) => {
        itemCounts[row.albumId] = Number(row.count);
      });
    }

    // Attach itemCount to each album
    const albumsWithCount = albums.map((a) => ({
      ...a,
      itemCount: itemCounts[a.id] || 0,
    }));

    return NextResponse.json(albumsWithCount);
  } catch (error) {
    console.error("Error fetching albums:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}

// Create a new album
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Album name is required" },
        { status: 400 }
      );
    }

    const [newAlbum] = await db
      .insert(album)
      .values({
        userId: session.user.id,
        name,
        description: description || null,
      })
      .returning();

    console.log("created album", newAlbum);

    return NextResponse.json(newAlbum);
  } catch (error) {
    console.error("Error creating album:", error);
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 }
    );
  }
}

// Update an album
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, description } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: "Album ID and name are required" },
        { status: 400 }
      );
    }

    // Check if the album belongs to the user
    const albumToUpdate = await db.query.album.findFirst({
      where: eq(album.id, id),
    });

    if (!albumToUpdate) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    if (albumToUpdate.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [updatedAlbum] = await db
      .update(album)
      .set({
        name,
        description: description || null,
        updatedAt: new Date(),
      })
      .where(eq(album.id, id))
      .returning();

    return NextResponse.json(updatedAlbum);
  } catch (error) {
    console.error("Error updating album:", error);
    return NextResponse.json(
      { error: "Failed to update album" },
      { status: 500 }
    );
  }
}

// Delete an album
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get("id");

    if (!albumId) {
      return NextResponse.json(
        { error: "Album ID is required" },
        { status: 400 }
      );
    }

    // Check if the album belongs to the user
    const albumToDelete = await db.query.album.findFirst({
      where: eq(album.id, albumId),
    });

    if (!albumToDelete) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    if (albumToDelete.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the album
    await db.delete(album).where(eq(album.id, albumId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting album:", error);
    return NextResponse.json(
      { error: "Failed to delete album" },
      { status: 500 }
    );
  }
}
