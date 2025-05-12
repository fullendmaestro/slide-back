import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Album } from "@/lib/db/schema";

interface AlbumState {
  albums: Album[];
  currentAlbumId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAlbums: (albums: Album[]) => void;
  addAlbum: (album: Album) => void;
  updateAlbum: (album: Album) => void;
  removeAlbum: (albumId: string) => void;
  setCurrentAlbum: (albumId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAlbumStore = create<AlbumState>()(
  devtools(
    persist(
      (set) => ({
        albums: [],
        currentAlbumId: null,
        isLoading: false,
        error: null,

        setAlbums: (albums) => set({ albums }),

        addAlbum: (album) =>
          set((state) => ({
            albums: [...state.albums, album],
          })),

        updateAlbum: (updatedAlbum) =>
          set((state) => ({
            albums: state.albums.map((album) =>
              album.id === updatedAlbum.id ? updatedAlbum : album
            ),
          })),

        removeAlbum: (albumId) =>
          set((state) => ({
            albums: state.albums.filter((album) => album.id !== albumId),
            currentAlbumId:
              state.currentAlbumId === albumId ? null : state.currentAlbumId,
          })),

        setCurrentAlbum: (albumId) => set({ currentAlbumId: albumId }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),
      }),
      {
        name: "album-storage",
        partialize: (state) => ({
          albums: state.albums,
          currentAlbumId: state.currentAlbumId,
        }),
      }
    )
  )
);
