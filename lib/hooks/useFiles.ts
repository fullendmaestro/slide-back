import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useFileStore } from "@/lib/stores/fileStore";
import type { File } from "@/lib/db/schema";

interface UseFilesOptions {
  albumId?: string | null;
  favorites?: boolean;
}

// Fetch files
export function useFiles(options: UseFilesOptions = {}) {
  const { albumId, favorites } = options;
  const setFiles = useFileStore((state) => state.setFiles);

  return useQuery({
    queryKey: ["files", { albumId, favorites }],
    queryFn: async () => {
      let url = "/api/files";

      // Add query parameters
      const params = new URLSearchParams();
      if (albumId) params.append("albumId", albumId);
      if (favorites) params.append("favorites", "true");

      // Append params to URL if any exist
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch files");
      }

      const data = await response.json();
      setFiles(data);
      return data;
    },
    // Refetch on window focus and every 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  const uploadFile = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<File | null> => {
    const formData = new FormData();
    if (file instanceof Blob) {
      formData.append("file", file);
    } else {
      throw new Error("Invalid file type. Expected a Blob or File.");
    }

    try {
      // Create a custom fetch with progress tracking
      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<File>((resolve, reject) => {
        xhr.open("POST", "/api/files/upload");

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (error) {
              reject(new Error("Invalid response format"));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during upload"));
        };

        xhr.send(formData);
      });

      const result = await uploadPromise;

      // Invalidate files query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["files"] });

      return result;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  return {
    uploadFile,
    isUploading: false, // We're handling the state manually with the progress callback
  };
}

// Delete a file
export function useDeleteFile() {
  const queryClient = useQueryClient();
  const removeFile = useFileStore((state) => state.removeFile);

  return useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete file");
      }

      return { fileId };
    },
    onSuccess: ({ fileId }) => {
      removeFile(fileId);
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("File deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete file"
      );
    },
  });
}

// Update file details
export function useUpdateFile() {
  const queryClient = useQueryClient();
  const updateFile = useFileStore((state) => state.updateFile);

  return useMutation({
    mutationFn: async ({ updates }: { updates: Partial<File> }) => {
      const response = await fetch(`/api/files/${updates.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update file");
      }

      return response.json();
    },
    onSuccess: (updatedFile) => {
      updateFile(updatedFile);
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("File updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update file"
      );
    },
  });
}

export function useUpdateFileDescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { fileId: string; description: string }) => {
      const response = await fetch(`/api/files/description`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update file description");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: (error) => {
      console.error("Error updating file description:", error);
      toast.error("Failed to update file description");
    },
  });
}

// Toggle favorite status
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const updateFile = useFileStore((state) => state.updateFile);

  return useMutation({
    mutationFn: async ({
      fileId,
      isFavorite,
    }: {
      fileId: string;
      isFavorite: boolean;
    }) => {
      const response = await fetch(`/api/files/${fileId}/favorite`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isFavorite }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update favorite status");
      }

      return response.json();
    },
    onSuccess: (updatedFile) => {
      updateFile(updatedFile);
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success(
        updatedFile.isFavorite ? "Added to favorites" : "Removed from favorites"
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update favorite status"
      );
    },
  });
}
