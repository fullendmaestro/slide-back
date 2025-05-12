"use client";

import { useState } from "react";
import MemoryWizardForm from "@/components/wizard/MemoryWizardForm";
import SlideshowPlayerWrapper from "@/components/slideshow/SlideshowPlayerWrapper";
import type { MemoryWizardData } from "@/lib/schema";

export default function WizardAsHomePage() {
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [wizardFormData, setWizardFormData] = useState<MemoryWizardData | null>(
    null
  );

  const handleWizardSubmit = (data: MemoryWizardData) => {
    setWizardFormData(data);
    setShowSlideshow(true);
  };

  const handleExitSlideshow = () => {
    setShowSlideshow(false);
    setWizardFormData(null);
  };

  return (
    <div className="w-screen flex flex-col flex-grow items-center justify-center p-0 sm:p-0 md:p-0">
      {!showSlideshow ? (
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-8">
          <MemoryWizardForm onSubmitForm={handleWizardSubmit} />
        </div>
      ) : (
        <SlideshowPlayerWrapper onExit={handleExitSlideshow} />
      )}
    </div>
  );
}
