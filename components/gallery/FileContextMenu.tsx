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
  const { setAddToAlbumOpen } = useAlbumStore();

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate({
      fileId: file.id,
      isFavorite: !file.isFavorite,
    });

    toast.success(
      file.isFavorite ? "Removed from favorites" : "Added to favorites",
      {
        description: file.name,
      }
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

  const handleDownload = () => {
    if (file.url) {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started", {
        description: file.name,
      });
    } else {
      toast.error("Download failed", {
        description: "File URL is not available",
      });
    }
  };

  const handleCopyLink = () => {
    if (file.url) {
      navigator.clipboard.writeText(file.url);
      toast.success("Link copied to clipboard", {
        description: file.name,
      });
    } else {
      toast.error("Copy failed", {
        description: "File URL is not available",
      });
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
          console.error("Error sharing:", error);
          toast.error("Sharing failed", {
            description: error.message,
          });
        });
    } else {
      handleCopyLink();
    }
  };

  const handleViewDetails = () => {
    // Use the callback to avoid infinite re-renders
    onViewDetails(file);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={handleToggleFavorite}>
          <Star
            className={`mr-2 h-4 w-4 ${
              file.isFavorite ? "text-amber-500 fill-amber-500" : ""
            }`}
          />
          {file.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onAddToAlbum(file)}>
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
