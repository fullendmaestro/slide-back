import Image from "next/image";
import type { SlideData } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface SlideProps {
  slide: SlideData;
  isActive: boolean;
  onVideoEnded?: () => void; // Optional callback for video end
}

export default function Slide({ slide, isActive, onVideoEnded }: SlideProps) {
  const baseTransition = "transition-opacity duration-1000 ease-in-out";
  const activeClass = isActive
    ? "opacity-100"
    : "opacity-0 pointer-events-none";

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (
      slide.type === "video" &&
      isActive &&
      videoRef.current &&
      onVideoEnded
    ) {
      const handleEnded = () => {
        onVideoEnded();
      };
      const video = videoRef.current;
      video.addEventListener("ended", handleEnded);
      return () => {
        video.removeEventListener("ended", handleEnded);
      };
    }
  }, [slide.type, isActive, onVideoEnded]);

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
          className="absolute inset-0 w-full h-full filter blur-xl scale-110 z-0"
          priority={isActive}
          sizes="100vw"
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
              objectFit="contain"
              className="drop-shadow-2xl"
              priority={isActive}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
              data-ai-hint={slide.dataAiHint || "gallery image"}
            />
          </div>
        </div>
      </div>
    );
  }

  if (slide.type === "video") {
    return (
      <video
        ref={videoRef}
        src={slide.src}
        className={cn(
          "absolute inset-0 w-full h-full object-contain z-10",
          baseTransition,
          activeClass
        )}
        autoPlay={isActive}
        muted
        loop={false} // Only play once
        playsInline
      />
    );
  }

  return null;
}
