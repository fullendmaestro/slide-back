import type { File, Album } from "@/lib/db/schema";

export type FileWithAlbum = File & {
  albums?: Album[];
};
