import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAlbumStore } from "@/lib/stores/albumStore";
import type { Album } from "@/lib/db/schema";

// Fetch all albums
export function useAlbums() {
  const queryClient = useQueryClient();
  const { setAlbums, setLoading, setError } = useAlbumStore();

  return useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/albums");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch albums");
        }

        const data = await response.json();
        setAlbums(data);
        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch albums";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    // Refetch on window focus and every 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
    // On success, update the album store
    // onSuccess: (data) => {
    //   setAlbums(data);
    // },
    // On error, set the error in the album store
    // onError: (error) => {
    //   setError(
    //     error instanceof Error ? error.message : "Failed to fetch albums"
    //   );
    // },
  });
}

// Create a new album
export function useCreateAlbum() {
  const queryClient = useQueryClient();
  const { addAlbum } = useAlbumStore();

  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => {
      const response = await fetch("/api/albums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create album");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Add the new album to the store
      addAlbum(data);
      // Invalidate the albums query to refetch
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      toast.success("Album created successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create album"
      );
    },
  });
}

// Update an album
export function useUpdateAlbum() {
  const queryClient = useQueryClient();
  const { updateAlbum } = useAlbumStore();

  return useMutation({
    mutationFn: async (album: Partial<Album> & { id: string }) => {
      const response = await fetch("/api/albums", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(album),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update album");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update the album in the store
      updateAlbum(data);
      // Invalidate the albums query to refetch
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      // If files are affected, invalidate the files query too
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("Album updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update album"
      );
    },
  });
}

// Delete an album
export function useDeleteAlbum() {
  const queryClient = useQueryClient();
  const { removeAlbum } = useAlbumStore();

  return useMutation({
    mutationFn: async (albumId: string) => {
      const response = await fetch(`/api/albums?id=${albumId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete album");
      }

      return { albumId };
    },
    onSuccess: ({ albumId }) => {
      // Remove the album from the store
      removeAlbum(albumId);
      // Invalidate the albums query to refetch
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      // Invalidate the files query to refetch (in case files were in this album)
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("Album deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete album"
      );
    },
  });
}

// Add files to an album
export function useAddFilesToAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      albumId,
      fileIds,
    }: {
      albumId: string;
      fileIds: string[];
    }) => {
      const response = await fetch("/api/albums/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ albumId, fileIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add files to album");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate both albums and files queries to refetch
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("Files added to album successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to add files to album"
      );
    },
  });
}

// Remove files from an album
export function useRemoveFilesFromAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      albumId,
      fileIds,
    }: {
      albumId: string;
      fileIds: string[];
    }) => {
      const response = await fetch("/api/albums/files", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ albumId, fileIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove files from album");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate both albums and files queries to refetch
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("Files removed from album successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove files from album"
      );
    },
  });
}

// Get files in an album
export function useAlbumFiles(albumId: string | null) {
  return useQuery({
    queryKey: ["albumFiles", albumId],
    queryFn: async () => {
      if (!albumId) return [];

      const response = await fetch(`/api/albums/${albumId}/files`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch album files");
      }

      return response.json();
    },
    // Only run the query if albumId is provided
    enabled: !!albumId,
  });
}
