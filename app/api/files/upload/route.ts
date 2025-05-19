import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { file } from "@/lib/db/schema";
import { generateEmbedding } from "@/lib/ai/embedding";
import { generateFileDescription } from "@/lib/ai/generateDescription";
import { z } from "zod";

// File validation schema
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 50 * 1024 * 1024, {
      message: "File size should be less than 50MB",
    })
    .refine(
      (file) => {
        const type = file.type;
        return type.startsWith("image/") || type.startsWith("video/");
      },
      {
        message: "File type should be an image or video",
      }
    ),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const uploadedFile = formData.get("file") as File;

    if (!uploadedFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate the file
    const validatedFile = FileSchema.safeParse({ file: uploadedFile });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = uploadedFile.name.split(".").pop();
    const uniqueFilename = `${session.user.id}/${timestamp}-${uploadedFile.name}`;
    console.log("uploadind...", uniqueFilename, uploadedFile);

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, uploadedFile, {
      access: "public",
    });

    // Determine file type
    const fileType = uploadedFile.type.startsWith("image/") ? "image" : "video";

    // Generate AI description
    const aiDescription = await generateFileDescription(
      blob.url,
      fileType,
      uploadedFile.name
    );

    // Generate embedding for the description
    const embedding = await generateEmbedding(aiDescription);

    // Save file metadata to database
    const [newFile] = await db
      .insert(file)
      .values({
        userId: session.user.id,
        name: uploadedFile.name,
        type: fileType,
        size: uploadedFile.size,
        url: blob.url,
        thumbnailUrl: blob.url, // For simplicity, using the same URL for thumbnail
        aiDescription,
        embedding: JSON.stringify(embedding),
        metadata: {
          contentType: uploadedFile.type,
          width: fileType === "image" ? 0 : undefined, // Would be populated with actual dimensions
          height: fileType === "image" ? 0 : undefined,
          duration: fileType === "video" ? 0 : undefined,
        },
      })
      .returning();

    return NextResponse.json(newFile);
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
