"use client";

import SlideshowPlayer from "./SlideshowPlayer";
import { MOCK_SLIDES } from "@/lib/constants"; // Using mock slides for now
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
// import type { MemoryWizardData } from "@/lib/schema"; // For future use if wizardData influences slides

interface SlideshowPlayerWrapperProps {
  onExit: () => void;
  // wizardData?: MemoryWizardData; // For future use
}

export default function SlideshowPlayerWrapper({
  onExit,
}: SlideshowPlayerWrapperProps) {
  return (
    // This div will overlay the page content, taking full viewport
    <div className="fixed inset-0 z-40 bg-neutral-950 flex flex-col items-center justify-center p-0 m-0">
      {" "}
      {/* Darker background */}
      {/* Player occupies the entire space. */}
      <div className="w-full h-full relative flex items-center justify-center">
        <SlideshowPlayer slides={MOCK_SLIDES} />

        {/* Exit button positioned on top of the player */}
        <Button
          variant="ghost"
          onClick={onExit}
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
