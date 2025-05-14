import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Album } from "@/lib/db/schema";
import { devtools } from "@/lib/stores/devtools";

type AlbumView = "all" | "album" | "favorites";

interface AlbumState {
  // Album data
  albums: Album[];
  loading: boolean;
  error: string | null;

  // UI state
  currentAlbumId: string | null;
  currentView: AlbumView;
  isAddToAlbumOpen: boolean;

  // Actions - Album data
  setAlbums: (albums: Album[]) => void;
  addAlbum: (album: Album) => void;
  updateAlbum: (album: Album) => void;
  removeAlbum: (albumId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions - UI state
  setCurrentAlbum: (albumId: string | null) => void;
  setCurrentView: (view: AlbumView) => void;
  setAddToAlbumOpen: (isOpen: boolean) => void;
}

export const useAlbumStore = create<AlbumState>()(
  persist(
    (set) => ({
      // Album data
      albums: [],
      loading: false,
      error: null,

      // UI state
      currentAlbumId: null,
      currentView: "all",
      isAddToAlbumOpen: false,

      // Actions - Album data
      setAlbums: (albums) => set({ albums }),
      addAlbum: (album) =>
        set((state) => ({
          albums: [...state.albums, album],
        })),
      updateAlbum: (updatedAlbum) =>
        set((state) => ({
          albums: state.albums.map((album) =>
            album.id === updatedAlbum.id ? { ...album, ...updatedAlbum } : album
          ),
        })),
      removeAlbum: (albumId) =>
        set((state) => ({
          albums: state.albums.filter((album) => album.id !== albumId),
          // If the current album is being removed, reset to "all" view
          currentAlbumId:
            state.currentAlbumId === albumId ? null : state.currentAlbumId,
          currentView:
            state.currentAlbumId === albumId ? "all" : state.currentView,
        })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Actions - UI state
      setCurrentAlbum: (albumId) => set({ currentAlbumId: albumId }),
      setCurrentView: (view) => set({ currentView: view }),
      setAddToAlbumOpen: (isOpen) => set({ isAddToAlbumOpen: isOpen }),
    }),
    {
      name: "slide-back-album-store",
      partialize: (state) => ({
        currentAlbumId: state.currentAlbumId,
        currentView: state.currentView,
      }),
    }
  )
);
