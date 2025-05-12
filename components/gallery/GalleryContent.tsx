"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, GripVertical } from "lucide-react";
import { MOCK_USER_FILES, type UserFile } from "@/lib/constants";
import FileDisplayIcon from "@/components/files/FileDisplayIcon";
import FileActions from "@/components/files/FileActions";
import { format } from "date-fns";
import GalleryToolbar from "./GalleryToolbar";
import FileCard from "./FileCard";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button"; // Added for delete confirmation
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ViewMode = "grid-sm" | "grid-md" | "grid-lg" | "list";
export type SortByType =
  | "name"
  | "dateModified"
  | "dateCreated"
  | "dateTaken"
  | "size"
  | "type";
export type SortOrderType = "asc" | "desc";

export default function GalleryContent() {
  const [files, setFiles] = useState<UserFile[]>(MOCK_USER_FILES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("grid-md");
  const [sortBy, setSortBy] = useState<SortByType>("dateModified");
  const [sortOrder, setSortOrder] = useState<SortOrderType>("desc");

  const handleDeleteFile = (fileId: string) => {
    const fileToDelete = files.find((f) => f.id === fileId);
    if (!fileToDelete) return;

    setFiles((currentFiles) =>
      currentFiles.filter((file) => file.id !== fileId)
    );
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      next.delete(fileId);
      return next;
    });
    toast(`"${fileToDelete.name}" has been deleted.`);
    // API call to delete file would go here
  };

  const handleDeselectAll = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedFiles.size === 0) return;

    const numSelected = selectedFiles.size;
    const fileOrFiles = numSelected === 1 ? "file" : "files";

    toast.error(`Delete ${numSelected} selected ${fileOrFiles}?`, {
      description: `This action cannot be undone. ${
        numSelected > 1 ? "All selected files" : "The selected file"
      } will be permanently deleted.`,
      action: {
        label: "Confirm Delete",
        onClick: () => {
          setFiles((currentFiles) =>
            currentFiles.filter((file) => !selectedFiles.has(file.id))
          );
          setSelectedFiles(new Set());
          toast(`${numSelected} ${fileOrFiles} deleted.`);
          // API call for bulk delete would go here
        },
      },
    });
  }, [selectedFiles, files, toast]);

  const handleSelectFile = useCallback((fileId: string, checked: boolean) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(fileId);
      } else {
        next.delete(fileId);
      }
      return next;
    });
  }, []);

  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files.filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let compareA: any;
      let compareB: any;

      const getDateValue = (dateStr: string | undefined): number => {
        return dateStr ? new Date(dateStr).getTime() : 0;
      };

      switch (sortBy) {
        case "name":
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case "dateModified":
          compareA = getDateValue(a.lastModified);
          compareB = getDateValue(b.lastModified);
          break;
        case "dateCreated":
          compareA = getDateValue(a.dateCreated);
          compareB = getDateValue(b.dateCreated);
          break;
        case "dateTaken":
          compareA = getDateValue(a.dateTaken);
          compareB = getDateValue(b.dateTaken);
          break;
        case "size":
          const parseSize = (sizeStr: string) => {
            if (a.type === "folder" || b.type === "folder") {
              if (a.type === "folder" && b.type !== "folder") return -1;
              if (a.type !== "folder" && b.type === "folder") return 1;
              return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
            }
            const parts = sizeStr.toLowerCase().split(" ");
            if (parts.length < 2) return 0;
            const value = parseFloat(parts[0]);
            if (parts[1].startsWith("kb")) return value * 1024;
            if (parts[1].startsWith("mb")) return value * 1024 * 1024;
            if (parts[1].startsWith("gb")) return value * 1024 * 1024 * 1024;
            return value;
          };
          compareA = parseSize(a.size);
          compareB = parseSize(b.size);
          break;
        case "type":
          compareA = a.type.toLowerCase();
          compareB = b.type.toLowerCase();
          break;
        default:
          return 0;
      }

      if (
        sortBy === "dateTaken" ||
        sortBy === "dateCreated" ||
        sortBy === "dateModified"
      ) {
        if (compareA === 0 && compareB !== 0)
          return sortOrder === "asc" ? -1 : 1;
        if (compareA !== 0 && compareB === 0)
          return sortOrder === "asc" ? 1 : -1;
      }

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [files, searchTerm, sortBy, sortOrder]);

  const isAllSelected = useMemo(() => {
    return (
      filteredAndSortedFiles.length > 0 &&
      selectedFiles.size === filteredAndSortedFiles.length
    );
  }, [filteredAndSortedFiles, selectedFiles.size]);

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredAndSortedFiles.map((f) => f.id)));
    }
  }, [filteredAndSortedFiles, isAllSelected]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const gridClasses = {
    "grid-sm":
      "grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10",
    "grid-md":
      "grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7",
    "grid-lg":
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, fileId: string) => {
    e.dataTransfer.setData("fileId", fileId);
    const draggedFile = files.find((f) => f.id === fileId);
    if (draggedFile) {
      // toast({title: `Dragging "${draggedFile.name}"`}); // Optional: reduce toast verbosity
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const targetElement = e.currentTarget as HTMLDivElement;
    if (targetElement.classList.contains("drop-target-folder")) {
      targetElement.classList.add("bg-primary/10", "ring-2", "ring-primary");
    }
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const targetElement = e.currentTarget as HTMLDivElement;
    targetElement.classList.remove("bg-primary/10", "ring-2", "ring-primary");
  };

  const onDropToFolder = (
    e: React.DragEvent<HTMLDivElement>,
    targetFolderId: string
  ) => {
    e.preventDefault();
    onDragLeave(e);
    const draggedFileId = e.dataTransfer.getData("fileId");

    const draggedFile = files.find((f) => f.id === draggedFileId);
    const targetFolder = files.find((f) => f.id === targetFolderId);

    if (
      draggedFile &&
      targetFolder &&
      targetFolder.type === "folder" &&
      draggedFileId !== targetFolderId
    ) {
      toast.success(
        `Moved "${draggedFile.name}" into "${targetFolder.name}" (mock action)`
      );
      // Example:
      // setFiles(prevFiles => prevFiles.filter(f => f.id !== draggedFileId));
      // Consider optimistic update or refetching folder contents
    } else if (targetFolder && targetFolder.type !== "folder") {
      toast(`Cannot drop onto "${targetFolder.name}". Not a folder.`);
    } else if (draggedFileId === targetFolderId) {
      toast.error(`Cannot drop a folder onto itself.`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <GalleryToolbar
        fileCount={
          filteredAndSortedFiles.filter((f) => f.type === "image").length
        }
        videoCount={
          filteredAndSortedFiles.filter((f) => f.type === "video").length
        }
        selectedFileCount={selectedFiles.size}
        onSelectAll={handleSelectAll}
        isAllSelected={isAllSelected}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(newSortBy, newSortOrder) => {
          setSortBy(newSortBy);
          setSortOrder(newSortOrder);
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onDeselectAll={handleDeselectAll}
        onDeleteSelected={handleDeleteSelected}
      />
      {filteredAndSortedFiles.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
          <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-primary/50" />
          <p className="text-lg font-medium">No files found.</p>
          <p className="text-sm">
            {searchTerm
              ? "Try adjusting your search term."
              : "Upload some files or check other albums!"}
          </p>
        </div>
      ) : (
        <div className="flex-grow overflow-auto p-4">
          {viewMode === "list" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px] px-2">
                      {selectedFiles.size === 0 && (
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all files in current view"
                        />
                      )}
                    </TableHead>
                    <TableHead className="w-[50px] px-2 sm:px-4"></TableHead>{" "}
                    {/* Icon */}
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell w-[120px] sm:w-[150px]">
                      Size
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-[150px] sm:w-[180px]">
                      {sortBy === "dateCreated" && "Date Created"}
                      {sortBy === "dateTaken" && "Date Taken"}
                      {(sortBy === "dateModified" ||
                        (sortBy !== "dateCreated" && sortBy !== "dateTaken")) &&
                        "Date Modified"}
                    </TableHead>
                    <TableHead className="text-right w-[80px] px-2 sm:px-4">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedFiles.map((file) => (
                    <TableRow
                      key={file.id}
                      className="hover:bg-muted/50 group transition-colors"
                      data-state={
                        selectedFiles.has(file.id) ? "selected" : "unselected"
                      }
                      onClick={() =>
                        handleSelectFile(file.id, !selectedFiles.has(file.id))
                      } // Select on row click
                      draggable={file.type !== "folder"}
                      onDragStart={(e) =>
                        file.type !== "folder" && onDragStart(e, file.id)
                      }
                      onDragOver={
                        file.type === "folder" ? onDragOver : undefined
                      }
                      onDrop={
                        file.type === "folder"
                          ? (e) => onDropToFolder(e, file.id)
                          : undefined
                      }
                      onDragLeave={
                        file.type === "folder" ? onDragLeave : undefined
                      }
                    >
                      <TableCell
                        className="px-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {" "}
                        {/* Stop propagation for checkbox cell */}
                        <Checkbox
                          checked={selectedFiles.has(file.id)}
                          onCheckedChange={(checked) =>
                            handleSelectFile(file.id, Boolean(checked))
                          }
                          aria-label={`Select file ${file.name}`}
                        />
                      </TableCell>
                      <TableCell className="px-2 sm:px-4">
                        <FileDisplayIcon
                          type={file.type}
                          className="text-muted-foreground group-hover:text-primary transition-colors"
                        />
                      </TableCell>
                      <TableCell
                        className="font-medium text-foreground truncate max-w-[150px] sm:max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl"
                        title={file.name}
                      >
                        {file.name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {file.type === "folder" ? "-" : file.size}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {sortBy === "dateCreated"
                          ? formatDate(file.dateCreated)
                          : sortBy === "dateTaken"
                          ? formatDate(file.dateTaken)
                          : formatDate(file.lastModified)}
                      </TableCell>
                      <TableCell
                        className="text-right px-2 sm:px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {" "}
                        {/* Stop propagation for actions cell */}
                        <FileActions
                          file={file}
                          onDelete={() => handleDeleteFile(file.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div
              className={`grid ${
                gridClasses[viewMode as keyof typeof gridClasses]
              } gap-3 sm:gap-4 transition-all duration-300 ease-in-out`}
            >
              {filteredAndSortedFiles.map((file) => (
                <div
                  key={file.id}
                  draggable={file.type !== "folder"}
                  onDragStart={(e) =>
                    file.type !== "folder" && onDragStart(e, file.id)
                  }
                  onDragOver={file.type === "folder" ? onDragOver : undefined}
                  onDrop={
                    file.type === "folder"
                      ? (e) => onDropToFolder(e, file.id)
                      : undefined
                  }
                  onDragLeave={file.type === "folder" ? onDragLeave : undefined}
                  className={cn(
                    "transition-all duration-150 ease-out",
                    file.type === "folder"
                      ? "drop-target-folder rounded-lg"
                      : ""
                  )}
                >
                  <FileCard
                    file={file}
                    isSelected={selectedFiles.has(file.id)}
                    onSelect={handleSelectFile}
                    onDelete={() => handleDeleteFile(file.id)}
                    viewMode={viewMode as "grid-sm" | "grid-md" | "grid-lg"}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
