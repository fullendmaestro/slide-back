"use client";

import {
  MoreHorizontal,
  Star,
  FolderPlus,
  Download,
  Link as ILink,
  Share2,
  FileEdit,
  Trash2,
  Info,
  Eye,
  ScanEye,
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
import { useDeleteFile, useToggleFavorite } from "@/lib/hooks/useFiles";
import { toast } from "sonner";
import Link from "next/link";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFileStore } from "@/lib/stores/fileStore";
import { useAlbumStore } from "@/lib/stores/albumStore";

interface FileActionsProps {
  file: File;
}

export default function FileActions({ file }: FileActionsProps) {
  const router = useRouter();
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 bg-primary">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/files/${file.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          Open
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOpenPreview}>
          <ScanEye className="mr-2 h-4 w-4" />
          Preview
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggleFavorite}>
          <Star
            className={`mr-2 h-4 w-4 ${
              file.isFavorite ? "text-amber-500 fill-amber-500" : ""
            }`}
          />
          {file.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAddToAlbum}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Add to Album
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <ILink className="mr-2 h-4 w-4" />
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
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
