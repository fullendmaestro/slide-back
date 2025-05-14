"use client";

import SlideshowPlayer from "./SlideshowPlayer";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useMemoryStore } from "@/lib/stores/memoryStore";

interface SlideshowPlayerWrapperProps {
  onExit: () => void;
}

export default function SlideshowPlayerWrapper({
  onExit,
}: SlideshowPlayerWrapperProps) {
  const results = useMemoryStore((state) => state.slides);
  const isLoading = useMemoryStore((state) => state.isLoading);
  const error = useMemoryStore((state) => state.error);
  const reset = useMemoryStore((state) => state.resetMemory);

  const handleExit = () => {
    reset(); // Reset the memory store
    onExit(); // Call the parent's onExit function
  };

  // Convert the results to the format expected by SlideshowPlayer
  const slides = results.map((file) => ({
    id: file.id,
    type: file.type as "image" | "video",
    src: file.url,
    alt: file.description || file.aiDescription || file.name,
    duration: 5, // Default duration
    dataAiHint: file.aiDescription || undefined,
  }));

  return (
    // This div will overlay the page content, taking full viewport
    <div className="fixed inset-0 z-40 bg-neutral-950 flex flex-col items-center justify-center p-0 m-0">
      {/* Darker background */}
      {/* Player occupies the entire space. */}
      <div className="w-full h-full relative flex items-center justify-center">
        {isLoading ? (
          <div className="text-white text-xl">Loading your memories...</div>
        ) : error ? (
          <div className="text-red-500 text-xl">{error}</div>
        ) : slides.length === 0 ? (
          <div className="text-white text-xl">
            No memories found. Try a different search.
          </div>
        ) : (
          <SlideshowPlayer slides={slides} />
        )}

        {/* Exit button positioned on top of the player */}
        <Button
          variant="ghost"
          onClick={handleExit}
          className="absolute top-4 left-4 z-50 text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm px-3 py-2 h-auto rounded-lg flex items-center space-x-1.5 transition-colors duration-150 shadow-lg"
          aria-label="Exit Slideshow"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Exit Slideshow</span>
        </Button>
      </div>
    </div>
  );
}
