import { create } from "zustand";
import { devtools } from "@/lib/stores/devtools";

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface MemoryState {
  prompt: string;
  dateRange: DateRange;
  albumId: string | null;
  mood: string;
  musicEnabled: boolean;
  captionsEnabled: boolean;
  isPlaying: boolean;
  currentSlideIndex: number;
  slides: any[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setPrompt: (prompt: string) => void;
  setDateRange: (dateRange: DateRange) => void;
  setAlbumId: (albumId: string | null) => void;
  setMood: (mood: string) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setCaptionsEnabled: (enabled: boolean) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentSlideIndex: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  setSlides: (slides: any[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetMemory: () => void;
  searchMemories: () => Promise<void>;
}

export const useMemoryStore = create<MemoryState>()(
  devtools(
    (set, get) => ({
      prompt: "",
      dateRange: {},
      albumId: null,
      mood: "nostalgic",
      musicEnabled: true,
      captionsEnabled: true,
      isPlaying: false,
      currentSlideIndex: 0,
      slides: [],
      isLoading: false,
      error: null,

      setPrompt: (prompt) => set({ prompt }),
      setDateRange: (dateRange) => set({ dateRange }),
      setAlbumId: (albumId) => set({ albumId }),
      setMood: (mood) => set({ mood }),
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      setCaptionsEnabled: (enabled) => set({ captionsEnabled: enabled }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),
      nextSlide: () => {
        const { currentSlideIndex, slides } = get();
        if (currentSlideIndex < slides.length - 1) {
          set({ currentSlideIndex: currentSlideIndex + 1 });
        }
      },
      prevSlide: () => {
        const { currentSlideIndex } = get();
        if (currentSlideIndex > 0) {
          set({ currentSlideIndex: currentSlideIndex - 1 });
        }
      },
      setSlides: (slides) => set({ slides }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      resetMemory: () =>
        set({
          prompt: "",
          dateRange: {},
          albumId: null,
          mood: "nostalgic",
          musicEnabled: true,
          captionsEnabled: true,
          isPlaying: false,
          currentSlideIndex: 0,
          slides: [],
          isLoading: false,
          error: null,
        }),
      searchMemories: async () => {
        const { prompt, dateRange, albumId } = get();

        if (!prompt) {
          set({ error: "Please enter a memory prompt" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/memory", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: prompt,
              dateRange:
                dateRange.from || dateRange.to
                  ? {
                      from: dateRange.from?.toISOString(),
                      to: dateRange.to?.toISOString(),
                    }
                  : undefined,
              albumId: albumId || undefined,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to search memories");
          }

          const data = await response.json();

          if (data.results.length === 0) {
            set({
              error: "No memories found matching your criteria",
              isLoading: false,
              slides: [],
            });
            return;
          }

          set({
            slides: data.results,
            isLoading: false,
            isPlaying: true,
            currentSlideIndex: 0,
          });
        } catch (error) {
          console.error("Error searching memories:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "An unknown error occurred",
            isLoading: false,
          });
        }
      },
    }),
    { name: "Memory Store" }
  )
);
