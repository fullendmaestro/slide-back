"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner"; // Updated to use sonner
import { MoreHorizontal, Download, Trash2, Edit3, Info } from "lucide-react";
import type { File } from "@/lib/db/schema";

interface FileActionsProps {
  file: File;
  onDelete: (fileId: string) => void; // Callback to handle deletion in parent
  className?: string;
}

export default function FileActions({
  file,
  onDelete,
  className,
}: FileActionsProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click or other parent events
    if (file.url) {
      toast.success(`Preparing to download ${file.name}`);
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${file.name} download started.`);
    } else {
      toast.error(
        "Download not available. This file does not have a download link."
      );
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.error(
      `"${file.name}" will be deleted. This action cannot be undone.`,
      {
        action: {
          label: "Confirm Delete",
          onClick: () => {
            onDelete(file.id);
            toast.success(`"${file.name}" has been deleted.`);
          },
        },
      }
    );
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info(`Rename action for ${file.name} (not implemented)`);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info(`Details for ${file.name} (not implemented)`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 text-white/80 hover:text-white hover:bg-black/30 ${className}`}
          onClick={(e) => e.stopPropagation()} // Important to stop propagation
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More actions for {file.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-popover text-popover-foreground"
        onClick={(e) => e.stopPropagation()} // Stop propagation for content items too
      >
        <DropdownMenuItem onClick={handleViewDetails}>
          <Info className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRename}>
          <Edit3 className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDownload}
          disabled={!file.url || file.type === "folder"}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDeleteClick}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
