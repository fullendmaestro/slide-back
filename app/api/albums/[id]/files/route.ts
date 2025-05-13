import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { albumFile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const albumId = params.id;

    if (!albumId) {
      return NextResponse.json(
        { error: "Album ID is required" },
        { status: 400 }
      );
    }

    // Get all files in the album
    const albumFiles = await db.query.albumFile.findMany({
      where: eq(albumFile.albumId, albumId),
      with: {
        file: true,
      },
    });

    // Extract the files from the albumFiles
    const files = albumFiles
      .map((af) => af.file)
      .filter((f) => f.userId === session.user.id);

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching album files:", error);
    return NextResponse.json(
      { error: "Failed to fetch album files" },
      { status: 500 }
    );
  }
}
