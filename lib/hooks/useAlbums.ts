import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAlbumStore } from "@/lib/stores/albumStore";
import type { Album } from "@/lib/db/schema";

// Fetch all albums
export function useAlbums() {
  const setAlbums = useAlbumStore((state) => state.setAlbums);
  const setLoading = useAlbumStore((state) => state.setLoading);
  const setError = useAlbumStore((state) => state.setError);

  return useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/albums");

        if (!response.ok) {
          throw new Error("Failed to fetch albums");
        }

        const data = await response.json();
        setAlbums(data);
        return data;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch albums"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}

// Create a new album
export function useCreateAlbum() {
  const queryClient = useQueryClient();
  const addAlbum = useAlbumStore((state) => state.addAlbum);

  const mutation = useMutation({
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
        const error = await response.json();
        throw new Error(error.error || "Failed to create album");
      }

      return response.json();
    },
    onSuccess: (data) => {
      addAlbum(data);
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      toast.success("Album created successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create album"
      );
    },
  });

  return mutation;
}

// Update an album
export function useUpdateAlbum() {
  const queryClient = useQueryClient();
  const updateAlbum = useAlbumStore((state) => state.updateAlbum);

  const mutation = useMutation({
    mutationFn: async (album: Partial<Album> & { id: string }) => {
      const response = await fetch("/api/albums", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(album),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update album");
      }

      return response.json();
    },
    onSuccess: (data) => {
      updateAlbum(data);
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      toast.success("Album updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update album"
      );
    },
  });

  return mutation;
}

// Delete an album
export function useDeleteAlbum() {
  const queryClient = useQueryClient();
  const removeAlbum = useAlbumStore((state) => state.removeAlbum);

  const mutation = useMutation({
    mutationFn: async (albumId: string) => {
      const response = await fetch(`/api/albums?id=${albumId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete album");
      }

      return { albumId };
    },
    onSuccess: ({ albumId }) => {
      removeAlbum(albumId);
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      toast.success("Album deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete album"
      );
    },
  });

  return mutation;
}

// Add files to an album
export function useAddFilesToAlbum() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
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
        const error = await response.json();
        throw new Error(error.error || "Failed to add files to album");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("Files added to album successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to add files to album"
      );
    },
  });

  return mutation;
}

// Remove files from an album
export function useRemoveFilesFromAlbum() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
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
        const error = await response.json();
        throw new Error(error.error || "Failed to remove files from album");
      }

      return response.json();
    },
    onSuccess: () => {
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

  return mutation;
}
