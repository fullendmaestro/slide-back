import { embed, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/lib/db/schema";
import { file, albumFile } from "@/lib/db/schema";
import { eq, and, between, inArray, sql } from "drizzle-orm"; // Ensure this is imported

// Define the Gemini embedding model
const embeddingModel = google.textEmbeddingModel("text-embedding-004", {
  taskType: "SEMANTIC_SIMILARITY", // Optimized for text similarity
});

// Generate embedding for a text description
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: embeddingModel,
      value: text,
    });
    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

// Generate AI description for an image or video
export async function generateFileDescription(
  fileUrl: string,
  fileType: string
): Promise<string> {
  try {
    const prompt =
      fileType === "image"
        ? `Describe this image in detail: ${fileUrl}`
        : `Describe this video in detail: ${fileUrl}`;

    const { text } = await generateText({
      model: google("gemini-1.5-flash-002"),
      prompt,
    });

    return text;
  } catch (error) {
    console.error("Error generating file description:", error);
    return "No description available";
  }
}

// Find relevant content based on a query
export async function findRelevantContent(
  query: string,
  userId: string,
  dateRange?: { from?: Date; to?: Date },
  albumId?: string
): Promise<any> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Convert embedding to string for storage
    const queryEmbeddingString = JSON.stringify(queryEmbedding);

    // Build the SQL query for similarity search
    let filesQuery = db.select().from(file);
    filesQuery.where(eq(file.userId, userId));

    // Apply date filter if provided
    if (dateRange) {
      if (dateRange.from && dateRange.to) {
        filesQuery.where(
          and(
            between(
              sql`${file.dateTaken} OR ${file.dateCreated}`, // Use raw SQL for the OR condition
              dateRange.from,
              dateRange.to
            )
          )
        );
      } else if (dateRange.from) {
        filesQuery.where(
          sql`${file.dateTaken} OR ${file.dateCreated} >= ${dateRange.from}` // Use raw SQL for comparison
        );
      } else if (dateRange.to) {
        filesQuery.where(
          sql`${file.dateTaken} OR ${file.dateCreated} <= ${dateRange.to}` // Use raw SQL for comparison
        );
      }
    }

    // Apply album filter if provided
    if (albumId) {
      const albumFiles = await db
        .select({ fileId: albumFile.fileId })
        .from(albumFile)
        .where(eq(albumFile.albumId, albumId));

      const fileIds = albumFiles.map((af) => af.fileId);

      if (fileIds.length > 0) {
        filesQuery.where(inArray(file.id, fileIds));
      } else {
        // No files in this album
        return [];
      }
    }

    // Get all files that match the criteria
    const files = await filesQuery;

    // Calculate similarity scores (this is a simplified version - in production you'd use a vector database)
    const results = files.map((f) => {
      if (!f.embedding) return { ...f, score: 0 };

      const fileEmbedding = JSON.parse(f.embedding);
      const score = cosineSimilarity(queryEmbedding, fileEmbedding);

      return {
        ...f,
        score,
      };
    });

    // Sort by similarity score
    return results.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error("Error finding relevant content:", error);
    throw new Error("Failed to find relevant content");
  }
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
