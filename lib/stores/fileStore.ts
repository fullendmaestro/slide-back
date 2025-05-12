import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { File } from "@/lib/db/schema";

interface FileState {
  files: File[];
  selectedFiles: Set<string>;
  isLoading: boolean;
  error: string | null;

  // Actions
  setFiles: (files: File[]) => void;
  addFiles: (files: File[]) => void;
  updateFile: (file: File) => void;
  removeFile: (fileId: string) => void;
  selectFile: (fileId: string) => void;
  deselectFile: (fileId: string) => void;
  toggleFileSelection: (fileId: string) => void;
  selectAllFiles: () => void;
  deselectAllFiles: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFileStore = create<FileState>()(
  devtools(
    persist(
      (set) => ({
        files: [],
        selectedFiles: new Set<string>(),
        isLoading: false,
        error: null,

        setFiles: (files) => set({ files }),

        addFiles: (newFiles) =>
          set((state) => ({
            files: [...state.files, ...newFiles],
          })),

        updateFile: (updatedFile) =>
          set((state) => ({
            files: state.files.map((file) =>
              file.id === updatedFile.id ? updatedFile : file
            ),
          })),

        removeFile: (fileId) =>
          set((state) => ({
            files: state.files.filter((file) => file.id !== fileId),
            selectedFiles: new Set(
              Array.from(state.selectedFiles).filter((id) => id !== fileId)
            ),
          })),

        selectFile: (fileId) =>
          set((state) => ({
            selectedFiles: new Set([...state.selectedFiles, fileId]),
          })),

        deselectFile: (fileId) =>
          set((state) => {
            const newSelectedFiles = new Set(state.selectedFiles);
            newSelectedFiles.delete(fileId);
            return { selectedFiles: newSelectedFiles };
          }),

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

        selectAllFiles: () =>
          set((state) => ({
            selectedFiles: new Set(state.files.map((file) => file.id)),
          })),

        deselectAllFiles: () =>
          set({
            selectedFiles: new Set(),
          }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),
      }),
      {
        name: "file-storage",
        partialize: (state) => ({ files: state.files }),
      }
    )
  )
);
