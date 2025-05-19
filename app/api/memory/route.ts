import { eq, and, between, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { findRelevantContent, reviewContentWithAI } from "@/lib/ai/embedding";
import { z } from "zod";
import { db, file } from "@/lib/db";

const MemorySearchSchema = z.object({
  query: z.string().min(1, "Query is required"),
  dateRange: z
    .object({
      from: z.string().optional().nullable(),
      to: z.string().optional().nullable(),
    })
    .optional(),
  albumIds: z.array(z.string()).optional(),
  aiReview: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("memory body", body);
    // const validatedData = MemorySearchSchema.safeParse(body);

    // if (!validatedData.success) {
    //   return NextResponse.json(
    //     { error: validatedData.error.errors[0].message },
    //     { status: 400 }
    //   );
    // }

    // const { query, dateRange, albumIds, aiReview } = validatedData.data;

    // Convert string dates to Date objects if they exist
    // const parsedDateRange = dateRange
    //   ? {
    //       from: dateRange.from ? new Date(dateRange.from) : undefined,
    //       to: dateRange.to ? new Date(dateRange.to) : undefined,
    //     }
    //   : undefined;

    // Find relevant content based on embedding similarity
    // let results = await findRelevantContent(
    //   query,
    //   session.user.id,
    //   parsedDateRange,
    //   albumIds
    // );

    // If AI review is enabled, filter results using AI
    // if (aiReview && results.length > 0) {
    //   results = await reviewContentWithAI(query, results);
    // }

    let filesQuery = db.select().from(file);
    filesQuery.where(eq(file.userId, session?.user?.id));
    const results = await filesQuery;
    console.log("memory results", results);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching memories:", error);
    return NextResponse.json(
      { error: "Failed to search memories" },
      { status: 500 }
    );
  }
}
