import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useFileStore } from "@/lib/stores/fileStore";

// Fetch all files
export function useFiles(albumId?: string) {
  const setFiles = useFileStore((state) => state.setFiles);
  const setLoading = useFileStore((state) => state.setLoading);
  const setError = useFileStore((state) => state.setError);

  return useQuery({
    queryKey: ["files", albumId],
    queryFn: async () => {
      setLoading(true);
      try {
        const url = albumId ? `/api/files?albumId=${albumId}` : "/api/files";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }

        const data = await response.json();
        setFiles(data);
        return data;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch files"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}

// Upload a file
export function useUploadFile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (file: File, onProgress?: (progress: number) => void) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload file");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  return {
    uploadFile: mutation.mutateAsync,
    isUploading: mutation.isPending,
    error: mutation.error,
  };
}

// Update file description
export function useUpdateFileDescription() {
  const queryClient = useQueryClient();
  const updateFile = useFileStore((state) => state.updateFile);

  const mutation = useMutation({
    mutationFn: async ({
      fileId,
      description,
    }: {
      fileId: string;
      description: string;
    }) => {
      const response = await fetch("/api/files/description", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update description");
      }

      return response.json();
    },
    onSuccess: (data) => {
      updateFile(data);
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("Description updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update description"
      );
    },
  });

  return mutation;
}

// Delete a file
export function useDeleteFile() {
  const queryClient = useQueryClient();
  const removeFile = useFileStore((state) => state.removeFile);

  const mutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/files?id=${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete file");
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

  return mutation;
}
