"use client";

import { useState, useMemo, useCallback } from "react";
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
import { toast } from "sonner";
import { format } from "date-fns";
import GalleryToolbar from "./GalleryToolbar";
import FileCard from "./FileCard";
import { Checkbox } from "../ui/checkbox";

type ViewMode = "grid-sm" | "grid-md" | "grid-lg" | "list";
type SortByType = "name" | "date" | "size" | "type";
type SortOrderType = "asc" | "desc";

export default function GalleryContent() {
  const [files, setFiles] = useState<UserFile[]>(MOCK_USER_FILES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("grid-md");
  const [sortBy, setSortBy] = useState<SortByType>("date");
  const [sortOrder, setSortOrder] = useState<SortOrderType>("desc");

  const handleDeleteFile = (fileId: string) => {
    setFiles((currentFiles) =>
      currentFiles.filter((file) => file.id !== fileId)
    );
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      next.delete(fileId);
      return next;
    });
    toast.success("File deleted successfully.");
  };

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

    // Sorting logic
    filtered.sort((a, b) => {
      let compareA: any;
      let compareB: any;

      switch (sortBy) {
        case "name":
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case "date":
          compareA = new Date(a.lastModified).getTime();
          compareB = new Date(b.lastModified).getTime();
          break;
        case "size":
          const parseSize = (sizeStr: string) => {
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

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [files, searchTerm, sortBy, sortOrder]);

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredAndSortedFiles.map((f) => f.id)));
    }
  }, [filteredAndSortedFiles, selectedFiles]);

  const isAllSelected =
    filteredAndSortedFiles.length > 0 &&
    selectedFiles.size === filteredAndSortedFiles.length;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const gridClasses = {
    "grid-sm":
      "grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10",
    "grid-md":
      "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
    "grid-lg":
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, fileId: string) => {
    e.dataTransfer.setData("fileId", fileId);
    toast(`Dragging ${files.find((f) => f.id === fileId)?.name}`);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDropToFolder = (
    e: React.DragEvent<HTMLDivElement>,
    targetFolderId: string
  ) => {
    e.preventDefault();
    const draggedFileId = e.dataTransfer.getData("fileId");
    if (draggedFileId && draggedFileId !== targetFolderId) {
      const draggedFile = files.find((f) => f.id === draggedFileId);
      const targetFolder = files.find((f) => f.id === targetFolderId);
      if (draggedFile && targetFolder && targetFolder.type === "folder") {
        toast.success(
          `Dropped "${draggedFile.name}" onto "${targetFolder.name}".`
        );
      } else if (targetFolder && targetFolder.type !== "folder") {
        toast.error(`Cannot drop onto "${targetFolder.name}". Not a folder.`);
      }
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
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all files in current view"
                      />
                    </TableHead>
                    <TableHead className="w-[50px] px-2 sm:px-4"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell w-[120px] sm:w-[150px]">
                      Size
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-[150px] sm:w-[180px]">
                      Last Modified
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
                      className="hover:bg-muted/50 group"
                      data-selected={selectedFiles.has(file.id)}
                      draggable={file.type !== "folder"}
                      onDragStart={(e) =>
                        file.type !== "folder" && onDragStart(e, file.id)
                      }
                      onDragOver={onDragOver}
                      onDrop={(e) => onDropToFolder(e, file.id)}
                    >
                      <TableCell className="px-2">
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
                          className="text-muted-foreground group-hover:text-primary"
                        />
                      </TableCell>
                      <TableCell
                        className="font-medium text-foreground truncate max-w-[150px] sm:max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl"
                        title={file.name}
                      >
                        {file.name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {file.size}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDate(file.lastModified)}
                      </TableCell>
                      <TableCell className="text-right px-2 sm:px-4">
                        <FileActions file={file} onDelete={handleDeleteFile} />
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
              } gap-2 transition-all duration-300 ease-in-out`}
            >
              {filteredAndSortedFiles.map((file) => (
                <div
                  key={file.id}
                  draggable={file.type !== "folder"}
                  onDragStart={(e) =>
                    file.type !== "folder" && onDragStart(e, file.id)
                  }
                  onDragOver={onDragOver}
                  onDrop={(e) => onDropToFolder(e, file.id)}
                  className={file.type === "folder" ? "drop-target-folder" : ""}
                >
                  <FileCard
                    file={file}
                    isSelected={selectedFiles.has(file.id)}
                    onSelect={handleSelectFile}
                    onDelete={handleDeleteFile}
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
