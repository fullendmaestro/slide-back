import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function generateFileDescription(
  fileUrl: string,
  fileType: string,
  fileName: string
): Promise<string> {
  try {
    // Create a more focused prompt based on file type
    let prompt = "";

    if (fileType === "image") {
      prompt = `
        Analyze this image: ${fileUrl}
        
        Provide a CONCISE description (max 2-3 sentences) focusing specifically on:
        - The mood or emotional tone of the image
        - The location or setting
        - Any notable events or activities happening
        - People present (if any) and their relationship (family, friends, etc.)
        
        Keep your description brief but evocative, focusing on the emotional and memory aspects.
        Filename for context: ${fileName}
      `;
    } else if (fileType === "video") {
      prompt = `
        Analyze this video: ${fileUrl}
        
        Provide a CONCISE description (max 2-3 sentences) focusing specifically on:
        - The mood or emotional tone of the video
        - The location or setting
        - Any notable events or activities happening
        - People present (if any) and their relationship (family, friends, etc.)
        
        Keep your description brief but evocative, focusing on the emotional and memory aspects.
        Filename for context: ${fileName}
      `;
    } else {
      prompt = `Briefly describe this file: ${fileUrl} (Filename: ${fileName})`;
    }

    const { text } = await generateText({
      model: google("gemini-1.5-flash-002"),
      prompt,
      temperature: 0.7, // Add some creativity but keep it factual
      maxTokens: 150, // Limit to ensure conciseness
    });

    return text;
  } catch (error) {
    console.error("Error generating file description:", error);
    return "No description available";
  }
}
