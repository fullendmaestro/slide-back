"use client";

import SlideshowPlayer from "./SlideshowPlayer";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useMemoryStore } from "@/lib/stores/memoryStore";

export default function SlideshowPlayerWrapper() {
  const results = useMemoryStore((state) => state.results);
  const isLoading = useMemoryStore((state) => state.isLoading);
  const error = useMemoryStore((state) => state.error);
  const reset = useMemoryStore((state) => state.reset);
  const setShowSlideshow = useMemoryStore((state) => state.setShowSlideshow);

  const handleExit = () => {
    reset(); // Reset the memory store
    setShowSlideshow(false); // Call the parent's onExit function
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
          <SlideshowPlayer slides={slides} onExit={handleExit} />
        )}
      </div>
    </div>
  );
}
