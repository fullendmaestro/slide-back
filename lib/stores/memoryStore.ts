import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { File } from "@/lib/db/schema";

interface MemoryState {
  query: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  albumId: string | null;
  results: File[];
  currentIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setQuery: (query: string) => void;
  setDateRange: (from: Date | null, to: Date | null) => void;
  setAlbumId: (albumId: string | null) => void;
  setResults: (results: File[]) => void;
  setCurrentIndex: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  togglePlayback: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useMemoryStore = create<MemoryState>()(
  devtools((set) => ({
    query: "",
    dateRange: {
      from: null,
      to: null,
    },
    albumId: null,
    results: [],
    currentIndex: 0,
    isPlaying: false,
    isLoading: false,
    error: null,

    setQuery: (query) => set({ query }),

    setDateRange: (from, to) =>
      set({
        dateRange: { from, to },
      }),

    setAlbumId: (albumId) => set({ albumId }),

    setResults: (results) =>
      set({
        results,
        currentIndex: 0,
        isPlaying: results.length > 0,
      }),

    setCurrentIndex: (index) => set({ currentIndex: index }),

    nextSlide: () =>
      set((state) => ({
        currentIndex:
          (state.currentIndex + 1) % Math.max(1, state.results.length),
      })),

    prevSlide: () =>
      set((state) => ({
        currentIndex:
          (state.currentIndex - 1 + state.results.length) %
          state.results.length,
      })),

    togglePlayback: () =>
      set((state) => ({
        isPlaying: !state.isPlaying,
      })),

    setIsPlaying: (isPlaying) => set({ isPlaying }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    reset: () =>
      set({
        query: "",
        dateRange: {
          from: null,
          to: null,
        },
        albumId: null,
        results: [],
        currentIndex: 0,
        isPlaying: false,
        error: null,
      }),
  }))
);
