import { create } from "zustand";

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface MusicSettings {
  enabled: boolean;
  trackId?: string;
  source: "default" | "user";
}

export interface MemoryState {
  query: string;
  dateRangeFrom: Date | null;
  dateRangeTo: Date | null;
  albumIds: string[];
  music: MusicSettings;
  aiReview: boolean;
  results: any[];
  isLoading: boolean;
  showSlideshow: boolean;
  error: string | null;
}

interface MemoryActions {
  setQuery: (query: string) => void;
  setDateRange: (from: Date | null, to: Date | null) => void;
  setAlbumIds: (albumIds: string[]) => void;
  setMusic: (music: MusicSettings) => void;
  setAiReview: (aiReview: boolean) => void;
  setResults: (results: any[]) => void;
  setShowSlideshow: (isLoading: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: MemoryState = {
  query: "",
  dateRangeFrom: null,
  dateRangeTo: null,
  albumIds: [],
  music: {
    enabled: true,
    trackId: undefined,
    source: "default",
  },
  aiReview: false,
  results: [],
  showSlideshow: false,
  isLoading: false,
  error: null,
};

export const useMemoryStore = create<MemoryState & MemoryActions>()((set) => ({
  ...initialState,

  setQuery: (query) => set({ query }),

  setDateRange: (from, to) => set({ dateRangeFrom: from, dateRangeTo: to }),

  setAlbumIds: (albumIds) => set({ albumIds }),

  setMusic: (music) => set({ music }),

  setAiReview: (aiReview) => set({ aiReview }),

  setResults: (results) => set({ results }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setShowSlideshow: (showSlideshow) => set({ showSlideshow }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
