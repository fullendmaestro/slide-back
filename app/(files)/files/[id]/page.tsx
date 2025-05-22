import { notFound } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { file } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import FileDetailView from "@/components/files/FileDetailView";

export default async function FilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  const fileId = params.id;

  // Fetch the file
  const result = await db
    .select()
    .from(file)
    .where(and(eq(file.id, fileId), eq(file.userId, session.user.id)))
    .limit(1);

  if (result.length === 0) {
    return notFound();
  }

  const fileData = result[0];

  return <FileDetailView file={fileData} />;
}
