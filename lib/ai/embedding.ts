import { embed, generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/lib/db";
import { file, albumFile } from "@/lib/db/schema";
import { eq, and, between, inArray, sql } from "drizzle-orm";
import { z } from "zod";

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
// export async function generateFileDescription(
//   fileUrl: string,
//   fileType: string
// ): Promise<string> {
//   try {
//     const prompt =
//       fileType === "image"
//         ? `Describe this image concisely, focusing on moods, places, events, and people visible: ${fileUrl}`
//         : `Describe this video concisely, focusing on moods, places, events, and activities shown: ${fileUrl}`;

//     const { text } = await generateText({
//       model: google("gemini-1.5-flash-002"),
//       prompt,
//       maxTokens: 150, // Keep it concise
//     });

//     return text;
//   } catch (error) {
//     console.error("Error generating file description:", error);
//     return "No description available";
//   }
// }

// Find relevant content based on a query
export async function findRelevantContent(
  query: string,
  userId: string,
  dateRange?: { from?: Date; to?: Date },
  albumIds?: string[]
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
              sql`COALESCE(${file.dateTaken}, ${file.dateCreated})`,
              dateRange.from,
              dateRange.to
            )
          )
        );
      } else if (dateRange.from) {
        filesQuery.where(
          sql`COALESCE(${file.dateTaken}, ${file.dateCreated}) >= ${dateRange.from}`
        );
      } else if (dateRange.to) {
        filesQuery.where(
          sql`COALESCE(${file.dateTaken}, ${file.dateCreated}) <= ${dateRange.to}`
        );
      }
    }

    // Apply album filter if provided
    if (albumIds && albumIds.length > 0) {
      const albumFiles = await db
        .select({ fileId: albumFile.fileId })
        .from(albumFile)
        .where(inArray(albumFile.albumId, albumIds));

      const fileIds = albumFiles.map((af) => af.fileId);

      if (fileIds.length > 0) {
        filesQuery.where(inArray(file.id, fileIds));
      } else {
        // No files in these albums
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

// CRAG (Corrective Retrieval Augmented Generation) framework
// Review and filter search results using AI
export async function reviewContentWithAI(
  query: string,
  results: any[]
): Promise<any[]> {
  try {
    console.log("Reviewing content with AI:", query);
    if (results.length === 0) return results;

    const batchSize = 10;
    const reviewedResults: any[] = [];

    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize);

      // Create a prompt for the AI to review this batch
      const prompt = `
        I'm searching for memories related to: "${query}"
        
        Below are some potential matches. For each item, evaluate if it's truly relevant to my query.
        Return only the IDs of items that are relevant, as an array of strings.
        
        ${batch
          .map(
            (item, index) => `
          Item ${index + 1} (ID: ${item.id}):
          - Description: ${item.aiDescription || "No description"}
          - Type: ${item.type}
          - Date: ${item.dateTaken || item.dateCreated || "Unknown date"}
          - Tags: ${item.tags || "No tags"}
        `
          )
          .join("\n")}
      `;

      // Use generateObject for structured output
      const { object } = await generateObject({
        model: google("gemini-1.5-flash-002"),
        schema: z.object({
          relevantIds: z.array(z.string()),
        }),
        prompt,
        temperature: 0.2,
      });
      console.log("AI review structured response:", object);

      const relevantIds = object.relevantIds;

      // Filter the batch to only include relevant items
      const relevantItems = batch.filter((item) =>
        relevantIds.includes(item.id)
      );
      reviewedResults.push(...relevantItems);
    }

    console.log("Reviewed results:", reviewedResults);

    return reviewedResults;
  } catch (error) {
    console.error("Error reviewing content with AI:", error);
    return results;
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
