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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  LayoutGrid,
  List,
  MoreHorizontal,
  Play,
  Search,
  ArrowUpDown,
  Grid,
  Grid3X3,
  Square as SquareIcon,
  CalendarDays,
  CalendarPlus,
  FileEdit,
  CaseSensitive,
  ArrowUp,
  ArrowDown,
  X,
  Trash2, // Added X and Trash2 icons
} from "lucide-react";
import type { SortByType, SortOrderType } from "./GalleryContent"; // Import types from GalleryContent

type ViewMode = "grid-sm" | "grid-md" | "grid-lg" | "list";

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
  onDeselectAll: () => void; // New prop for deselecting all
  onDeleteSelected: () => void; // New prop for deleting selected
}

const sortByOptions: {
  value: SortByType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "dateTaken", label: "Date taken", icon: CalendarDays },
  { value: "dateCreated", label: "Date created", icon: CalendarPlus },
  { value: "dateModified", label: "Date modified", icon: FileEdit },
  { value: "name", label: "Name", icon: CaseSensitive },
];

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
  onDeselectAll,
  onDeleteSelected,
}: GalleryToolbarProps) {
  const totalMediaFiles = fileCount + videoCount;

  const currentViewType = viewMode.startsWith("grid") ? "square" : "river";
  const currentGridSize = viewMode.startsWith("grid") ? viewMode : undefined;

  return (
    <div className="p-4 border-b border-border space-y-4 bg-card sticky top-0 z-10">
      {" "}
      {/* Added sticky top and z-index */}
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
        {selectedFileCount > 0 ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              className="bg-background hover:bg-muted"
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <span className="text-sm text-muted-foreground font-medium">
              {selectedFileCount} selected
            </span>
            <div className="flex-grow"></div> {/* Spacer */}
            <Button
              variant="destructive"
              size="icon"
              onClick={onDeleteSelected}
              title="Delete selected items"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete selected</span>
            </Button>
            {/* Optionally add other bulk actions here */}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={isAllSelected && totalMediaFiles > 0}
                onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
                disabled={totalMediaFiles === 0}
              />
              <Label htmlFor="select-all" className="text-sm whitespace-nowrap">
                Select All
              </Label>
            </div>

            <Button
              variant="ghost"
              size="sm"
              disabled={selectedFileCount === 0}
            >
              <Play className="mr-2 h-4 w-4" /> Slideshow
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ArrowUpDown className="mr-2 h-4 w-4" /> Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={sortBy}
                  onValueChange={(newSortBy) =>
                    onSortChange(newSortBy as SortByType, sortOrder)
                  }
                >
                  {sortByOptions.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                      className="gap-2 cursor-pointer"
                    >
                      <option.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{option.label}</span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Order</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={sortOrder}
                  onValueChange={(newSortOrder) =>
                    onSortChange(sortBy, newSortOrder as SortOrderType)
                  }
                >
                  <DropdownMenuRadioItem
                    value="asc"
                    className="gap-2 cursor-pointer"
                  >
                    <ArrowUp className="h-4 w-4 text-muted-foreground" />
                    <span>Ascending</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="desc"
                    className="gap-2 cursor-pointer"
                  >
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    <span>Descending</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-auto sm:ml-0">
                  {viewMode === "list" ? (
                    <List className="mr-2 h-4 w-4" />
                  ) : (
                    <LayoutGrid className="mr-2 h-4 w-4" />
                  )}
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={currentViewType}
                  onValueChange={(value) => {
                    if (value === "river") {
                      onViewModeChange("list");
                    } else if (value === "square") {
                      if (viewMode === "list") {
                        onViewModeChange("grid-md");
                      }
                    }
                  }}
                >
                  <DropdownMenuRadioItem
                    value="river"
                    className="cursor-pointer"
                  >
                    <List className="mr-2 h-4 w-4" />
                    River
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="square"
                    className="cursor-pointer"
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Square
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Size</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={currentGridSize || "grid-md"}
                  onValueChange={(value) => {
                    onViewModeChange(value as ViewMode);
                  }}
                >
                  <DropdownMenuRadioItem
                    value="grid-sm"
                    disabled={currentViewType !== "square"}
                    className="cursor-pointer"
                  >
                    <Grid className="mr-2 h-4 w-4" /> Small
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="grid-md"
                    disabled={currentViewType !== "square"}
                    className="cursor-pointer"
                  >
                    <Grid3X3 className="mr-2 h-4 w-4" /> Medium
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="grid-lg"
                    disabled={currentViewType !== "square"}
                    className="cursor-pointer"
                  >
                    <SquareIcon className="mr-2 h-4 w-4" /> Large
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
