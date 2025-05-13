import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function generateFileDescription(
  fileUrl: string,
  fileType: string,
  fileName: string
): Promise<string> {
  try {
    // Create a more detailed prompt based on file type
    let prompt = "";

    if (fileType === "image") {
      prompt = `
        Analyze this image in detail: ${fileUrl}
        
        Provide a comprehensive description that includes:
        1. The main subject(s) or focus of the image
        2. Any people, objects, or scenery visible
        3. The setting or environment
        4. Notable colors, lighting, or mood
        5. Any text or signage visible
        6. Potential context or occasion (if apparent)
        
        Format your response as a cohesive paragraph that would help someone recall or search for this image later.
        Filename for context: ${fileName}
      `;
    } else if (fileType === "video") {
      prompt = `
        Analyze this video: ${fileUrl}
        
        Provide a comprehensive description that includes:
        1. The main subject(s) or focus of the video
        2. Any people, actions, or events visible
        3. The setting or environment
        4. Notable visual elements or audio components
        5. Potential context or purpose of the video
        
        Format your response as a cohesive paragraph that would help someone recall or search for this video later.
        Filename for context: ${fileName}
      `;
    } else {
      prompt = `Describe this file: ${fileUrl} (Filename: ${fileName})`;
    }

    const { text } = await generateText({
      model: google("gemini-1.5-flash-002"),
      prompt,
      temperature: 0.7, // Add some creativity but keep it factual
      maxTokens: 300, // Limit to a reasonable length
    });

    return text;
  } catch (error) {
    console.error("Error generating file description:", error);
    return "No description available";
  }
}
