"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  LayoutGrid,
  List,
  MoreHorizontal,
  Play,
  Search,
  ArrowUpDown,
  CheckSquare,
  Rows3,
  Columns3,
  Grid3X3,
} from "lucide-react";
import type { UserFile } from "@/lib/constants";

type ViewMode = "grid-sm" | "grid-md" | "grid-lg" | "list";
type SortByType = "name" | "date" | "size" | "type";
type SortOrderType = "asc" | "desc";

interface GalleryToolbarProps {
  fileCount: number; // Number of photos
  videoCount: number;
  selectedFileCount: number;
  onSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortByType;
  sortOrder: SortOrderType;
  onSortChange: (sortBy: SortByType, sortOrder: SortOrderType) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function GalleryToolbar({
  fileCount,
  videoCount,
  selectedFileCount,
  onSelectAll,
  isAllSelected,
  viewMode,
  onViewModeChange,
  sortBy,
  sortOrder,
  onSortChange,
  searchTerm,
  onSearchChange,
}: GalleryToolbarProps) {
  const totalMediaFiles = fileCount + videoCount; // Total files that are either photo or video

  return (
    <div className="p-4 border-b border-border space-y-4 bg-card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gallery</h1>
          <p className="text-sm text-muted-foreground">
            {fileCount} {fileCount === 1 ? "photo" : "photos"}, {videoCount}{" "}
            {videoCount === 1 ? "video" : "videos"}
          </p>
        </div>
        <div className="relative w-full sm:w-auto sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search in gallery..."
            className="w-full pl-10 shadow-sm bg-background focus:bg-background/90"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={isAllSelected && totalMediaFiles > 0}
            onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
            disabled={totalMediaFiles === 0} // Disable if no media files to select
          />
          <Label htmlFor="select-all" className="text-sm whitespace-nowrap">
            {selectedFileCount > 0
              ? `${selectedFileCount} selected`
              : "Select All"}
          </Label>
        </div>

        <Button variant="ghost" size="sm" disabled={selectedFileCount === 0}>
          <Play className="mr-2 h-4 w-4" /> Slideshow
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <ArrowUpDown className="mr-2 h-4 w-4" /> Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split("-") as [
                  SortByType,
                  SortOrderType
                ];
                onSortChange(newSortBy, newSortOrder);
              }}
            >
              {(["name", "date", "size", "type"] as SortByType[]).map((sBy) => (
                <DropdownMenuSub key={sBy}>
                  <DropdownMenuSubTrigger>
                    {sBy.charAt(0).toUpperCase() + sBy.slice(1)}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioItem value={`${sBy}-asc`}>
                      Ascending
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value={`${sBy}-desc`}>
                      Descending
                    </DropdownMenuRadioItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-auto sm:ml-0">
              {/* Display icon based on current view mode more explicitly */}
              {viewMode === "list" ? (
                <List className="mr-2 h-4 w-4" />
              ) : viewMode === "grid-sm" ? (
                <Columns3 className="mr-2 h-4 w-4" />
              ) : viewMode === "grid-md" ? (
                <Grid3X3 className="mr-2 h-4 w-4" />
              ) : (
                <LayoutGrid className="mr-2 h-4 w-4" />
              )}
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={viewMode}
              onValueChange={(value) => onViewModeChange(value as ViewMode)}
            >
              <DropdownMenuRadioItem value="list">
                <List className="mr-2 h-4 w-4" /> List
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="grid-sm">
                <Columns3 className="mr-2 h-4 w-4" /> Small Grid
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="grid-md">
                <Grid3X3 className="mr-2 h-4 w-4" /> Medium Grid
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="grid-lg">
                <LayoutGrid className="mr-2 h-4 w-4" /> Large Grid
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More options</span>
        </Button>
      </div>
    </div>
  );
}
