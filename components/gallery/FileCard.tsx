"use client";
import Image from "next/image";
import type React from "react";

import { useState } from "react";
import FileDisplayIcon from "@/components/files/FileDisplayIcon";
import type { File } from "@/lib/db/schema";
import { cn, formatBytes } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import FileActions from "@/components/files/FileActions";
import { motion } from "framer-motion";

interface FileCardProps {
  file: File;
  isSelected: boolean;
  onSelect: (fileId: string, checked: boolean) => void;
  onDelete: (fileId: string) => void;
  onDoubleClick: (file: File) => void;
  onRightClick: (e: React.MouseEvent, file: File) => void;
  viewMode: "grid-sm" | "grid-md" | "grid-lg";
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, file: File) => void;
  onAddToAlbum?: (file: File) => void;
  onViewDetails?: (file: File) => void;
}

export default function FileCard({
  file,
  isSelected,
  onSelect,
  onDelete,
  onDoubleClick,
  onRightClick,
  viewMode,
  onDragStart,
  onAddToAlbum,
  onViewDetails,
}: FileCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isImageFile = file.type === "image" && file.url;

  const cardSizeClasses = {
    "grid-sm": "aspect-square max-w-[150px]",
    "grid-md": "aspect-square max-w-[200px]",
    "grid-lg": "aspect-square max-w-[250px]",
  };

  const iconSizeClasses = {
    "grid-sm": "h-12 w-12",
    "grid-md": "h-16 w-16",
    "grid-lg": "h-20 w-20",
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Set data for the drag operation
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "file",
        id: file.id,
        name: file.name,
      })
    );

    // Create a custom drag image if it's an image file
    if (isImageFile && file.url && typeof window !== "undefined") {
      const img = new window.Image();
      img.src = file.url;
      img.width = 100;
      img.height = 100;
      e.dataTransfer.setDragImage(img, 50, 50);
    }

    setIsDragging(true);
    if (onDragStart) onDragStart(e, file);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handle right-click event
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default browser context menu
    e.stopPropagation(); // Stop event propagation
    if (onRightClick) {
      onRightClick(e, file);
    }
  };

  return (
    <motion.div
      className={cn(
        "relative group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-200 ease-in-out hover:shadow-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 w-full",
        isSelected && "ring-2 ring-primary ring-offset-2",
        isDragging && "opacity-50 scale-95",
        cardSizeClasses[viewMode]
      )}
      onClick={() => onSelect(file.id, !isSelected)}
      onDoubleClick={() => onDoubleClick(file)}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select file ${file.name}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      draggable
      onDragEnd={handleDragEnd}
    >
      {isImageFile ? (
        <div className="w-full h-full relative">
          <Image
            src={file.url || "/placeholder.svg"}
            alt={file.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={"gallery image"}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-muted/50">
          <FileDisplayIcon
            type={file.type}
            className={cn("text-muted-foreground", iconSizeClasses[viewMode])}
          />
        </div>
      )}

      {/* Overlay with file name and actions */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 flex flex-col justify-end p-2",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="text-white text-sm font-medium truncate">
          {file.name}
        </div>
        <div className="text-white/70 text-xs">{formatBytes(file.size)}</div>
      </div>

      {/* Selection checkbox - always visible when selected */}
      <div
        className={cn(
          "absolute top-2 left-2 transition-opacity duration-200",
          isSelected ? "opacity-100" : isHovered ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(file.id, Boolean(checked))}
          className="bg-black/30 border-white/70 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>

      {/* Actions button */}
      <div
        className={cn(
          "absolute top-2 right-2 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <FileActions
          file={file}
          onDelete={() => onDelete(file.id)}
          onAddToAlbum={onAddToAlbum || (() => {})}
          onViewDetails={onViewDetails || (() => {})}
        />
      </div>

      {/* Favorite indicator if file is favorited */}
      {file.isFavorite && (
        <div className="absolute bottom-2 right-2 text-amber-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
