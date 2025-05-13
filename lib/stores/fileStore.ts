import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { File } from "@/lib/db/schema";

interface FileState {
  files: File[];
  selectedFiles: Set<string>;
  viewMode: "grid-sm" | "grid-md" | "grid-lg" | "list";
  sortBy:
    | "name"
    | "dateModified"
    | "dateCreated"
    | "dateTaken"
    | "size"
    | "type";
  sortOrder: "asc" | "desc";
  searchTerm: string;
  isUploaderOpen: boolean;
  previewFile: File | null;
  detailsFile: File | null;

  // Actions
  setFiles: (files: File[]) => void;
  addFiles: (files: File[]) => void;
  updateFile: (file: File) => void;
  removeFile: (fileId: string) => void;
  toggleFileSelection: (fileId: string) => void;
  selectAllFiles: (fileIds: string[]) => void;
  deselectAllFiles: () => void;
  setViewMode: (mode: "grid-sm" | "grid-md" | "grid-lg" | "list") => void;
  setSortBy: (
    sortBy:
      | "name"
      | "dateModified"
      | "dateCreated"
      | "dateTaken"
      | "size"
      | "type"
  ) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setSearchTerm: (term: string) => void;
  setUploaderOpen: (isOpen: boolean) => void;
  setPreviewFile: (file: File | null) => void;
  setDetailsFile: (file: File | null) => void;
}

export const useFileStore = create<FileState>()(
  persist(
    (set) => ({
      files: [],
      selectedFiles: new Set<string>(),
      viewMode: "grid-md",
      sortBy: "dateModified",
      sortOrder: "desc",
      searchTerm: "",
      isUploaderOpen: false,
      previewFile: null,
      detailsFile: null,

      // Actions
      setFiles: (files) => set({ files }),
      addFiles: (newFiles) =>
        set((state) => ({
          files: [
            ...state.files,
            ...newFiles.filter(
              (f) => !state.files.some((existing) => existing.id === f.id)
            ),
          ],
        })),
      updateFile: (updatedFile) =>
        set((state) => ({
          files: state.files.map((f) =>
            f.id === updatedFile.id ? { ...f, ...updatedFile } : f
          ),
        })),
      removeFile: (fileId) =>
        set((state) => ({
          files: state.files.filter((f) => f.id !== fileId),
          selectedFiles: new Set(
            [...state.selectedFiles].filter((id) => id !== fileId)
          ),
        })),
      toggleFileSelection: (fileId) =>
        set((state) => {
          const newSelectedFiles = new Set(state.selectedFiles);
          if (newSelectedFiles.has(fileId)) {
            newSelectedFiles.delete(fileId);
          } else {
            newSelectedFiles.add(fileId);
          }
          return { selectedFiles: newSelectedFiles };
        }),
      selectAllFiles: (fileIds) => set({ selectedFiles: new Set(fileIds) }),
      deselectAllFiles: () => set({ selectedFiles: new Set() }),
      setViewMode: (viewMode) => set({ viewMode }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setUploaderOpen: (isUploaderOpen) => set({ isUploaderOpen }),
      setPreviewFile: (previewFile) => set({ previewFile }),
      setDetailsFile: (detailsFile) => set({ detailsFile }),
    }),
    {
      name: "slide-back-file-store",
      partialize: (state) => ({
        files: state.files,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }), // Only persist these properties
    }
  )
);
