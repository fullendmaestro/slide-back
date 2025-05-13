"use client";

import type React from "react";
import type { UserFile } from "@/lib/constants";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Heart,
  Download,
  Trash2,
  Share2,
  FolderPlus,
  Info,
  Copy,
  FileEdit,
} from "lucide-react";
import { useToggleFavorite, useDeleteFile } from "@/lib/hooks/useFiles";
import { toast } from "sonner";

interface FileContextMenuProps {
  file: UserFile;
  children: React.ReactNode;
  onAddToAlbum: (file: UserFile) => void;
  onViewDetails: (file: UserFile) => void;
}

export default function FileContextMenu({
  file,
  children,
  onAddToAlbum,
  onViewDetails,
}: FileContextMenuProps) {
  const toggleFavoriteMutation = useToggleFavorite();
  const deleteFileMutation = useDeleteFile();

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate({
      fileId: file.id,
      isFavorite: !file.isFavorite,
    });
  };

  const handleDelete = () => {
    toast.error(`Delete "${file.name}"?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => deleteFileMutation.mutate(file.id),
      },
    });
  };

  const handleDownload = () => {
    if (file.url) {
      // Create a temporary anchor element
      const a = document.createElement("a");
      a.href = file.url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success(`Downloading ${file.name}...`);
    } else {
      toast.error("Download URL not available");
    }
  };

  const handleCopyLink = () => {
    if (file.url) {
      navigator.clipboard.writeText(file.url);
      toast.success("Link copied to clipboard");
    } else {
      toast.error("URL not available");
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={handleToggleFavorite}>
          <Heart
            className={`mr-2 h-4 w-4 ${
              file.isFavorite ? "fill-amber-500 text-amber-500" : ""
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
          <Copy className="mr-2 h-4 w-4" />
          Copy Link
        </ContextMenuItem>

        <ContextMenuItem>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => onViewDetails(file)}>
          <Info className="mr-2 h-4 w-4" />
          View Details
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onViewDetails(file)}>
          <FileEdit className="mr-2 h-4 w-4" />
          Edit Description
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
