import Image from "next/image";
import type { SlideData } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SlideProps {
  slide: SlideData;
  isActive: boolean;
}

export default function Slide({ slide, isActive }: SlideProps) {
  const baseTransition = "transition-opacity duration-1000 ease-in-out";
  const activeClass = isActive
    ? "opacity-100"
    : "opacity-0 pointer-events-none";

  if (slide.type === "image") {
    return (
      <div
        className={cn(
          "absolute inset-0 w-full h-full",
          baseTransition,
          activeClass
        )}
      >
        {/* Background Image: Blurred and covering the area */}
        <Image
          src={slide.src}
          alt={slide.alt ? `${slide.alt} (background)` : "Slideshow background"}
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 w-full h-full filter blur-xl scale-110 z-0" // Increased blur and scale
          priority={isActive} // Prioritize loading active images
          sizes="100vw" // Background effectively covers viewport
          data-ai-hint={
            slide.dataAiHint
              ? `${slide.dataAiHint} background`
              : "background abstract"
          }
        />
        {/* Foreground Image: Centered and aspect ratio preserved */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10 p-4">
          <div className="relative w-full h-full max-w-full max-h-full">
            <Image
              src={slide.src}
              alt={slide.alt || "Slideshow image"}
              layout="fill"
              objectFit="contain" // Preserves aspect ratio and fits within bounds
              className="drop-shadow-2xl" // Added a shadow for better separation
              priority={isActive}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw" // Generous sizes for contained image
              data-ai-hint={slide.dataAiHint || "gallery image"}
            />
          </div>
        </div>
      </div>
    );
  }
  // Placeholder for video or other types - can be expanded similarly
  // For now, keeping video simple as it might have its own controls/behavior
  if (slide.type === "video") {
    return (
      <video
        src={slide.src}
        className={cn(
          "absolute inset-0 w-full h-full object-contain z-10",
          baseTransition,
          activeClass
        )}
        autoPlay={isActive}
        muted // Recommended for autoplay
        loop={isActive} // Or based on a setting
        playsInline // Good for mobile
      />
    );
  }

  return null;
}
