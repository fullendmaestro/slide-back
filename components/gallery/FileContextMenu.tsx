"use client";

import type React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
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
} from "lucide-react";
import type { File } from "@/lib/db/schema";
import { useToggleFavorite, useDeleteFile } from "@/lib/hooks/useFiles";
import { toast } from "sonner";
import { useAlbumStore } from "@/lib/stores/albumStore";
import { useCallback } from "react";
import { useFileStore } from "@/lib/stores/fileStore";

interface FileContextMenuProps {
  file: File;
  children: React.ReactNode;
  onAddToAlbum: (file: File) => void;
  onViewDetails: (file: File) => void;
}

export default function FileContextMenu({
  file,
  children,
  onAddToAlbum,
  onViewDetails,
}: FileContextMenuProps) {
  const toggleFavoriteMutation = useToggleFavorite();
  const deleteFileMutation = useDeleteFile();

  const { toggleFileSelection, deselectAllFiles } = useFileStore();

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
          toast.success("Shared successfully");
        })
        .catch((error) => {
          toast.error("Sharing failed", { description: error.message });
        });
    } else {
      handleCopyLink();
    }
  };

  // Update: Local handlers for Add to Album and View Details
  const handleAddToAlbum = () => {
    useCallback(
      (file: File) => {
        // Select just this file and open the add to album dialog
        deselectAllFiles();
        toggleFileSelection(file.id);
        setAddToAlbumOpen(true);
      },
      [deselectAllFiles, toggleFileSelection, setAddToAlbumOpen]
    );
  };

  const handleViewDetails = () => {
    onViewDetails(file);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div>{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
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
        <ContextMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
