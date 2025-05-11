"use client";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import FileDisplayIcon from "@/components/files/FileDisplayIcon";
import FileActions from "@/components/files/FileActions";
import type { UserFile } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FileCardProps {
  file: UserFile;
  isSelected: boolean;
  onSelect: (fileId: string, checked: boolean) => void;
  onDelete: (fileId: string) => void;
  viewMode: "grid-sm" | "grid-md" | "grid-lg";
}

export default function FileCard({
  file,
  isSelected,
  onSelect,
  onDelete,
  viewMode,
}: FileCardProps) {
  const isImageFile = file.type === "image" && file.url;

  const cardSizeClasses = {
    "grid-sm": "w-32 h-32 md:w-36 md:h-36",
    "grid-md": "w-48 h-48 md:w-56 md:h-56",
    "grid-lg": "w-64 h-64 md:w-72 md:h-72",
  };
  const iconSizeClasses = {
    "grid-sm": "h-12 w-12",
    "grid-md": "h-20 w-20",
    "grid-lg": "h-28 w-28",
  };

  return (
    <div
      className={cn(
        "relative group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-200 ease-in-out hover:shadow-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        isSelected && "ring-2 ring-primary ring-offset-2",
        cardSizeClasses[viewMode]
      )}
      onClick={() => onSelect(file.id, !isSelected)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(file.id, !isSelected);
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select file ${file.name}`}
    >
      {isImageFile ? (
        <Image
          src={file.url!}
          alt={file.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={file.dataAiHint || "gallery image"}
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-muted/50">
          <FileDisplayIcon
            type={file.type}
            className={cn("text-muted-foreground", iconSizeClasses[viewMode])}
          />
        </div>
      )}

      {/* Overlay for name, checkbox, and actions */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
        <div className="flex justify-between items-center w-full">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(file.id, Boolean(checked))}
            className="absolute top-2 left-2 z-10 bg-background/80 hover:bg-background border-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            aria-label={`Select ${file.name}`}
            onClick={(e) => e.stopPropagation()} // Prevent card click when interacting with checkbox
          />
          <p
            className={cn(
              "text-xs font-medium text-white truncate",
              viewMode === "grid-sm" ? "mt-auto" : "self-end"
            )}
            title={file.name}
          >
            {file.name}
          </p>
          <div
            className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <FileActions file={file} onDelete={onDelete} />
          </div>
        </div>
      </div>
      {/* Visible name when not hovered for small grid items */}
      {viewMode === "grid-sm" && !isSelected && (
        <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/40 backdrop-blur-sm group-hover:hidden group-focus-within:hidden">
          <p
            className="text-xs font-medium text-white truncate text-center"
            title={file.name}
          >
            {file.name}
          </p>
        </div>
      )}
    </div>
  );
}
