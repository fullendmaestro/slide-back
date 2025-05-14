"use client";

import {
  MoreHorizontal,
  Star,
  FolderPlus,
  Download,
  Link,
  Share2,
  FileEdit,
  Trash2,
  Info,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { File } from "@/lib/db/schema";
import { useToggleFavorite } from "@/lib/hooks/useFiles";
import { toast } from "sonner";

interface FileActionsProps {
  file: File;
  onDelete: () => void;
  onAddToAlbum: (file: File) => void;
  onViewDetails: (file: File) => void;
}

export default function FileActions({
  file,
  onDelete,
  onAddToAlbum,
  onViewDetails,
}: FileActionsProps) {
  const toggleFavoriteMutation = useToggleFavorite();

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleToggleFavorite}>
          <Star
            className={`mr-2 h-4 w-4 ${
              file.isFavorite ? "text-amber-500 fill-amber-500" : ""
            }`}
          />
          {file.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onAddToAlbum(file)}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Add to Album
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopyLink}>
          <Link className="mr-2 h-4 w-4" />
          Copy Link
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleViewDetails}>
          <Info className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleViewDetails}>
          <FileEdit className="mr-2 h-4 w-4" />
          Edit Description
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
