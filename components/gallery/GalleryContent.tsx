"use client";

import { Button } from "@/components/ui/button";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import FileDisplayIcon from "@/components/files/FileDisplayIcon";
import FileActions from "@/components/files/FileActions";
import { format } from "date-fns";
import GalleryToolbar from "./GalleryToolbar";
import FileCard from "./FileCard";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { useFileStore } from "@/lib/stores/fileStore";
import {
  useFiles,
  useDeleteFile,
  useToggleFavorite,
} from "@/lib/hooks/useFiles";
import { useAlbumStore } from "@/lib/stores/albumStore";
import { useAddFilesToAlbum } from "@/lib/hooks/useAlbums";
import FileUploader from "@/components/files/FileUploader";
import FilePreviewModal from "./FilePreviewModal";
import FileDetailsDialog from "./FileDetailsDialog";
import AddToAlbumDialog from "./AddToAlbumDialog";
import type { File } from "@/lib/db/schema";
import { motion, AnimatePresence } from "framer-motion";
import { formatBytes } from "@/lib/utils";
import FileContextMenu from "./FileContextMenu";

export default function GalleryContent() {
  // Use a ref to prevent infinite re-renders
  const detailsFileRef = useRef<File | null>(null);

  // Track right-click position for context menu
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [contextMenuFile, setContextMenuFile] = useState<File | null>(null);

  // Get state from file store
  const {
    selectedFiles,
    viewMode,
    sortBy,
    sortOrder,
    searchTerm,
    isUploaderOpen,
    previewFile,
    detailsFile,
    isPreviwerOpen,
    detailsOpen,
    toggleFileSelection,
    selectAllFiles,
    deselectAllFiles,
    setViewMode,
    setSortBy,
    setSortOrder,
    setSearchTerm,
    setUploaderOpen,
    setPreviewFile,
    setDetailsFile,
    setPreviwerOpen,
    setDetailsOpen,
  } = useFileStore();

  // Get state from album store
  const {
    currentAlbumId,
    currentView,
    isAddToAlbumOpen,
    setCurrentAlbum,
    setCurrentView,
    setAddToAlbumOpen,
  } = useAlbumStore();

  // Fetch files based on the current album and view
  const { data: files = [], isLoading } = useFiles({
    albumId: currentView === "album" ? currentAlbumId : undefined,
    favorites: currentView === "favorites",
  });

  // Mutations
  const deleteFileMutation = useDeleteFile();
  const toggleFavoriteMutation = useToggleFavorite();
  const addFilesToAlbumMutation = useAddFilesToAlbum();

  // Inside the GalleryContent component, add this function
  const handleFileDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    file: File
  ) => {
    // Set a class on the body to indicate dragging state
    document.body.classList.add("dragging-file");

    // You can add additional visual feedback here
  };

  // Add this function to handle drag end
  const handleDragEnd = () => {
    document.body.classList.remove("dragging-file");
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuPosition(null);
      setContextMenuFile(null);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Update the useEffect to add and remove event listeners
  useEffect(() => {
    // Clear selection when changing views
    deselectAllFiles();

    // Add event listener for drag end
    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, [currentAlbumId, currentView, deselectAllFiles]);

  const handleDeselectAll = useCallback(() => {
    deselectAllFiles();
  }, [deselectAllFiles]);

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
          // Delete each selected file
          Array.from(selectedFiles).forEach((fileId) => {
            deleteFileMutation.mutate(fileId);
          });
        },
      },
    });
  }, [selectedFiles, deleteFileMutation]);

  const handleSelectFile = useCallback(
    (fileId: string, checked: boolean) => {
      toggleFileSelection(fileId);
    },
    [toggleFileSelection]
  );

  const handleAddSelectedToFavorites = useCallback(() => {
    if (selectedFiles.size === 0) return;

    Array.from(selectedFiles).forEach((fileId) => {
      toggleFavoriteMutation.mutate({
        fileId,
        isFavorite: true,
      });
    });

    toast.success(
      `Added ${selectedFiles.size} ${
        selectedFiles.size === 1 ? "file" : "files"
      } to favorites`
    );
  }, [selectedFiles, toggleFavoriteMutation]);

  const handleAddSelectedToAlbum = useCallback(() => {
    if (selectedFiles.size === 0) return;
    setAddToAlbumOpen(true);
  }, [selectedFiles, setAddToAlbumOpen]);

  const filteredAndSortedFiles = useMemo(() => {
    const filtered = files.filter((file) =>
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
          compareB = b.dateTaken;
          break;
        case "size":
          compareA = a.size;
          compareB = b.size;
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
      deselectAllFiles();
    } else {
      selectAllFiles(filteredAndSortedFiles.map((f) => f.id));
    }
  }, [filteredAndSortedFiles, isAllSelected, selectAllFiles, deselectAllFiles]);

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
      "grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3",
    "grid-md":
      "grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4",
    "grid-lg":
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5",
  };

  const handleFileDoubleClick = (file: File) => {
    setPreviewFile(file);
    setPreviwerOpen(true);
  };

  // Handle right-click event
  const handleFileRightClick = (e: React.MouseEvent, file: File) => {
    e.preventDefault();
    e.stopPropagation();

    // Set the context menu position and file
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuFile(file);
  };

  // Get the title based on current view
  const getTitle = () => {
    if (currentView === "favorites") return "Favorites";
    if (currentView === "album" && currentAlbumId) {
      const album = files[0]?.albums?.find((a) => a.id === currentAlbumId);
      return album?.name || "Album";
    }
    return "Gallery";
  };

  // Get selected files objects
  const selectedFilesObjects = useMemo(() => {
    return filteredAndSortedFiles.filter((file) => selectedFiles.has(file.id));
  }, [filteredAndSortedFiles, selectedFiles]);

  return (
    <div className="flex flex-col h-full">
      <GalleryToolbar
        title={getTitle()}
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
        onUploadClick={() => setUploaderOpen(true)}
        onAddSelectedToAlbum={handleAddSelectedToAlbum}
        onAddSelectedToFavorites={handleAddSelectedToFavorites}
      />

      {isLoading ? (
        <div className="flex-grow flex flex-col items-center justify-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading files...</p>
        </div>
      ) : filteredAndSortedFiles.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
          <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-primary/50" />
          <p className="text-lg font-medium">No files found.</p>
          <p className="text-sm">
            {searchTerm
              ? "Try adjusting your search term."
              : currentView === "favorites"
              ? "You haven't added any files to your favorites yet."
              : currentView === "album"
              ? "This album is empty. Add some files to it!"
              : "Upload some files to get started!"}
          </p>
          {!isUploaderOpen && (
            <Button className="mt-4" onClick={() => setUploaderOpen(true)}>
              Upload Files
            </Button>
          )}
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
                      }
                      onDoubleClick={() => handleFileDoubleClick(file)}
                      onContextMenu={(e) => handleFileRightClick(e, file)}
                    >
                      <TableCell
                        className="px-2"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                        <FileContextMenu file={file}>
                          <div className="flex items-center">
                            <span className="truncate">{file.name}</span>
                            {file.isFavorite && (
                              <span className="ml-2 text-amber-500">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            )}
                          </div>
                        </FileContextMenu>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {formatBytes(file.size)}
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
                        <FileActions file={file} />
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
              } transition-all duration-300 ease-in-out`}
            >
              {filteredAndSortedFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  isSelected={selectedFiles.has(file.id)}
                  onSelect={handleSelectFile}
                  onDoubleClick={handleFileDoubleClick}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* File Upload Modal */}
      <FileUploader
        isOpen={isUploaderOpen}
        onClose={() => setUploaderOpen(false)}
      />

      {/* File Preview Modal */}
      {isPreviwerOpen && (
        <FilePreviewModal
          isOpen={isPreviwerOpen}
          onClose={() => setPreviwerOpen(false)}
          initialFile={previewFile!}
          files={filteredAndSortedFiles}
        />
      )}

      {/* File Details Dialog */}
      <FileDetailsDialog
        file={detailsFile}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />

      {/* Add to Album Dialog */}
      <AddToAlbumDialog
        isOpen={isAddToAlbumOpen}
        onClose={() => setAddToAlbumOpen(false)}
        files={selectedFilesObjects}
      />

      {/* Drag Indicator */}
      {/* <AnimatePresence>
        {document.body.classList.contains("dragging-file") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full shadow-lg z-50"
          >
            Drag to an album or favorites to add
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
}
