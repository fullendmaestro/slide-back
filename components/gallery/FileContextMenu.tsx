"use client";

import type React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import {
  Star,
  FolderPlus,
  Download,
  Link,
  Share2,
  FileEdit,
  Trash2,
  Info,
  Eye,
  ScanEye,
  MoreHorizontal,
  X,
} from "lucide-react";
import type { File } from "@/lib/db/schema";
import { useToggleFavorite, useDeleteFile } from "@/lib/hooks/useFiles";
import { toast } from "sonner";
import { useAlbumStore } from "@/lib/stores/albumStore";
import { useCallback } from "react";
import { useFileStore } from "@/lib/stores/fileStore";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { FileWithAlbum } from "@/lib/types";

interface FileContextMenuProps {
  file: FileWithAlbum;
  children: React.ReactNode;
}

export default function FileContextMenu({
  file,
  children,
}: FileContextMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient(); // Add this line
  const toggleFavoriteMutation = useToggleFavorite();
  const deleteFileMutation = useDeleteFile();

  const {
    toggleFileSelection,
    deselectAllFiles,
    setDetailsFile,
    setPreviewFile,
    setPreviwerOpen,
    setDetailsOpen,
  } = useFileStore();

  const { setAddToAlbumOpen } = useAlbumStore();

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate({
      fileId: file.id,
      isFavorite: !file.isFavorite,
    });
    toast.success(
      file.isFavorite ? "Removed from favorites" : "Added to favorites",
      { description: file.name }
    );
  };

  const handleDelete = () => {
    toast.error(`Delete "${file.name}"?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Confirm Delete",
        onClick: () => {
          deleteFileMutation.mutate(file.id);
        },
      },
    });
  };

  const handleDownload = async () => {
    console.log("file", file);
    if (file.url) {
      try {
        const response = await fetch(file.url, { mode: "cors" });
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Download started", { description: file.name });
      } catch (error) {
        toast.error("Download failed", {
          description: "Could not fetch file for download",
        });
      }
    } else {
      toast.error("Download failed", {
        description: "File URL is not available",
      });
    }
  };

  const handleCopyLink = () => {
    if (file.url) {
      navigator.clipboard.writeText(file.url);
      toast.success("Link copied to clipboard", { description: file.name });
    } else {
      toast.error("Copy failed", { description: "File URL is not available" });
    }
  };

  const handleShare = () => {
    if (navigator.share && file.url) {
      navigator
        .share({
          title: file.name,
          text: file.description || `Check out this ${file.type}`,
          url: file.url,
        })
        .then(() => {
          toast.success("Sharing opend successfully");
        })
        .catch((error) => {
          toast.error("Sharing failed", { description: error.message });
        });
    } else {
      handleCopyLink();
    }
  };

  const handleRemoveFromAlbum = async (albumId: string) => {
    try {
      const res = await fetch(`/api/albums/${albumId}/remove-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: file.id }),
      });
      if (!res.ok) throw new Error("Failed to remove from album");
      toast.success("Removed from album", { description: file.name });
      queryClient.invalidateQueries({ queryKey: ["files"] }); // Refresh files
    } catch (e) {
      toast.error("Failed to remove from album");
    }
  };

  // Update: Local handlers for Add to Album and View Details
  const handleAddToAlbum = () => {
    // Select just this file and open the add to album dialog
    deselectAllFiles();
    toggleFileSelection(file.id);
    setAddToAlbumOpen(true);
  };

  const handleViewDetails = () => {
    setDetailsFile(file);
    setDetailsOpen(true);
  };

  const handleOpenPreview = () => {
    setPreviewFile(file);
    setPreviwerOpen(true);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div>{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => router.push(`/files/${file.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          Open
        </ContextMenuItem>
        <ContextMenuItem onClick={handleOpenPreview}>
          <ScanEye className="mr-2 h-4 w-4" />
          Preview
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleToggleFavorite}>
          <Star
            className={`mr-2 h-4 w-4 ${
              file.isFavorite ? "text-amber-500 fill-amber-500" : ""
            }`}
          />
          {file.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleAddToAlbum}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Add to Album
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopyLink}>
          <Link className="mr-2 h-4 w-4" />
          Copy Link
        </ContextMenuItem>
        <ContextMenuItem onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleViewDetails}>
          <Info className="mr-2 h-4 w-4" />
          View Details
        </ContextMenuItem>
        <ContextMenuItem onClick={handleViewDetails}>
          <FileEdit className="mr-2 h-4 w-4" />
          Edit Description
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <FolderPlus className="mr-2 h-4 w-4" />
            In Albums
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {Array.isArray(file.albums) && file.albums.length > 0 ? (
              file.albums.map((album: any) => (
                <ContextMenuSub key={album.id}>
                  <ContextMenuSubTrigger>{album.name}</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem
                      onClick={() => handleRemoveFromAlbum(album.id)}
                      className="text-red-600"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove from this album
                    </ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
              ))
            ) : (
              <ContextMenuItem disabled>No albums</ContextMenuItem>
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
