"use client";

import MemoryWizardForm from "@/components/wizard/MemoryWizardForm";
import SlideshowPlayerWrapper from "@/components/slideshow/SlideshowPlayerWrapper";
import { useMemoryStore } from "@/lib/stores/memoryStore";

export default function WizardAsHomePage() {
  const showSlideshow = useMemoryStore((state) => state.showSlideshow);

  return (
    <div className="w-screen flex flex-col flex-grow items-center justify-center p-0 sm:p-0 md:p-0">
      {!showSlideshow ? (
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-8">
          <MemoryWizardForm />
        </div>
      ) : (
        <SlideshowPlayerWrapper />
      )}
    </div>
  );
}
