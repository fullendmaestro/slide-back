"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Pencil,
  Info,
  Star,
  Trash2,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToggleFavorite, useDeleteFile } from "@/lib/hooks/useFiles";
import { toast } from "sonner";
import FileDetailsDialog from "@/components/gallery/FileDetailsDialog";
import FileDisplayIcon from "@/components/files/FileDisplayIcon";
import { cn } from "@/lib/utils";
import FileContextMenu from "../gallery/FileContextMenu";
import FileActions from "./FileActions";
import AddToAlbumDialog from "../gallery/AddToAlbumDialog";
import { useFileStore } from "@/lib/stores/fileStore";
import { useAlbumStore } from "@/lib/stores/albumStore";

interface FileDetailViewProps {
  file: any;
}

export default function FileDetailView({ file }: FileDetailViewProps) {
  const router = useRouter();
  const { detailsOpen, setDetailsOpen } = useFileStore();
  const { isAddToAlbumOpen, setAddToAlbumOpen } = useAlbumStore();
  const isImage = file.type === "image" && file.url;
  const isVideo = file.type === "video" && file.url;

  const handleBack = () => {
    router.back();
  };

  return (
    <FileContextMenu file={file}>
      <div className="relative flex flex-col h-screen bg-black">
        {/* Top toolbar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
          <Button variant="ghost" onClick={handleBack} className="text-white">
            <ChevronLeft className="h-6 w-6" />
            Back
          </Button>

          <FileActions file={file}></FileActions>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center">
          {isImage ? (
            <div className="relative w-full h-full">
              <Image
                src={file.url || "/placeholder.svg"}
                alt={file.name || "Image"}
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : isVideo ? (
            <video
              src={file.url}
              className="max-h-full max-w-full"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-white">
              <FileDisplayIcon type={file.type} className="h-24 w-24 mb-4" />
              <h2 className="text-xl font-medium">{file.name}</h2>
              <p className="text-white/70 mt-2">{file.size}</p>
            </div>
          )}
        </div>

        {/* File Details Dialog */}
        <FileDetailsDialog
          file={file}
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
        />

        {/* Add to Album Dialog */}
        <AddToAlbumDialog
          isOpen={isAddToAlbumOpen}
          onClose={() => setAddToAlbumOpen(false)}
          files={[file]}
        />
      </div>
    </FileContextMenu>
  );
}
