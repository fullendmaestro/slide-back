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

        Here are some example descriptions:
        - "A joyful family gathered around a picnic table in a sunlit park, sharing laughter and homemade food. The mood is warm and nostalgic."
        - "A group of friends hiking along a misty mountain trail, surrounded by lush greenery. The atmosphere feels adventurous and close-knit."
        - "A child blowing out candles on a birthday cake in a cozy living room, with parents smiling nearby. The scene is festive and loving."

        Now, provide a CONCISE description (max 2-3 sentences) focusing specifically on:
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

        Here are some example descriptions:
        - "A lively birthday party in a backyard, with children playing games and adults chatting under string lights. The mood is cheerful and energetic."
        - "A couple walking hand-in-hand along a quiet beach at sunset, waves gently rolling in. The scene feels peaceful and romantic."
        - "Friends gathered around a campfire at night, sharing stories and laughter. The atmosphere is relaxed and intimate."

        Now, provide a CONCISE description (max 2-3 sentences) focusing specifically on:
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
