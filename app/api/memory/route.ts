import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { findRelevantContent } from "@/lib/ai/embedding";

// Search for memories based on a query
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const albumId = searchParams.get("albumId");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Prepare date range if provided
    let dateRange;
    if (fromDate || toDate) {
      dateRange = {
        from: fromDate ? new Date(fromDate) : undefined,
        to: toDate ? new Date(toDate) : undefined,
      };
    }

    // Find relevant content
    const results = await findRelevantContent(
      query,
      session.user.id,
      dateRange,
      albumId || undefined
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching memories:", error);
    return NextResponse.json(
      { error: "Failed to search memories" },
      { status: 500 }
    );
  }
}
