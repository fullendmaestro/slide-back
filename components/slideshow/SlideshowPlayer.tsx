"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DEFAULT_MUSIC_TRACK_ID,
  DEFAULT_MUSIC_SRC,
  type SlideData,
  type MusicTrack,
  MOCK_MUSIC_CATEGORIES,
  MOCK_USER_MUSIC,
} from "@/lib/constants";
import Slide from "./Slide";
import PlayerControls from "./PlayerControls";
import { cn } from "@/lib/utils";

const DEFAULT_SPEED = 1; // 1x speed
const DEFAULT_IMAGE_DURATION = 5; // 5 seconds per image by default

export interface SlideshowOptions {
  animationsEnabled: boolean;
  transitionsEnabled: boolean;
  autoLoopEnabled: boolean;
  musicEnabled: boolean;
  selectedMusicId: string | null;
}

interface SlideshowPlayerProps {
  slides: SlideData[];
  onExit: () => void;
}

export default function SlideshowPlayer({
  slides,
  onExit,
}: SlideshowPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(DEFAULT_SPEED);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  // Progress state is kept for calculating slide duration, but not passed to PlayerControls if progress bar is removed
  const [progress, setProgress] = useState(0);

  const [options, setOptions] = useState<SlideshowOptions>({
    animationsEnabled: false,
    transitionsEnabled: true,
    autoLoopEnabled: true,
    musicEnabled: false,
    selectedMusicId: null,
  });
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Only one ref for hiding controls
  const controlsHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlideDuration =
    (slides[currentIndex]?.duration || DEFAULT_IMAGE_DURATION) / currentSpeed;

  // Utility to clear the hide timer
  const clearControlsHideTimeout = useCallback(() => {
    if (controlsHideTimeoutRef.current) {
      clearTimeout(controlsHideTimeoutRef.current);
      controlsHideTimeoutRef.current = null;
    }
  }, []);

  // Show controls and reset the hide timer
  const showControlsAndResetTimer = useCallback(() => {
    setControlsVisible(true);
    clearControlsHideTimeout();
    controlsHideTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000); // 3 seconds
  }, [clearControlsHideTimeout]);

  // Show controls on mouse, touch, or keyboard activity
  useEffect(() => {
    showControlsAndResetTimer(); // Show on mount

    const handleMouseMove = () => showControlsAndResetTimer();
    const handleTouchStart = () => showControlsAndResetTimer();
    const handleKeyDown = () => showControlsAndResetTimer();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("keydown", handleKeyDown);
      clearControlsHideTimeout();
    };
  }, [showControlsAndResetTimer, clearControlsHideTimeout]);

  const handleNextSlide = useCallback(() => {
    if (!options.autoLoopEnabled && currentIndex === slides.length - 1) {
      setIsPlaying(false);
      setProgress(currentSlideDuration);
      return;
    }
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    setProgress(0);
  }, [
    slides.length,
    options.autoLoopEnabled,
    currentIndex,
    currentSlideDuration,
  ]);

  const handlePreviousSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
    setProgress(0);
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    if (isPlaying && slides.length > 0) {
      const slide = slides[currentIndex];
      const durationInSeconds =
        (slide.duration || DEFAULT_IMAGE_DURATION) / currentSpeed;

      progressIntervalRef.current = setInterval(() => {
        setProgress((p) => {
          const newProgress = p + 0.1;
          if (newProgress >= durationInSeconds) {
            if (progressIntervalRef.current)
              clearInterval(progressIntervalRef.current);
            return durationInSeconds;
          }
          return newProgress;
        });
      }, 100);

      timerRef.current = setTimeout(handleNextSlide, durationInSeconds * 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPlaying, currentSpeed, slides, handleNextSlide]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      if (
        progress >= currentSlideDuration &&
        currentIndex < slides.length - 1
      ) {
        handleNextSlide();
      } else if (
        progress >= currentSlideDuration &&
        options.autoLoopEnabled &&
        currentIndex === slides.length - 1
      ) {
        handleNextSlide();
      }
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    }
    // resetControlsTimer(); // This is handled by the useEffect that depends on isPlaying
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setProgress(0);
    setIsPlaying(true);
    // resetControlsTimer(); // Handled by useEffect
  };

  const handleSpeedChange = (speed: number) => {
    setCurrentSpeed(speed);
    // resetControlsTimer(); // Handled by useEffect
  };

  const handleFullscreenToggle = useCallback(async () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await playerRef.current.requestFullscreen();
      } catch (err) {
        console.error("Error attempting to enable full-screen mode:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // resetControlsTimer(); // Handled by useEffect
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const handleMusicSelect = useCallback((track: MusicTrack) => {
    setOptions((prev) => ({
      ...prev,
      selectedMusicId: track.id,
      musicEnabled: true,
    }));
    if (audioRef.current) {
      audioRef.current.src = track.audioSrc;
    }
    // resetControlsTimer(); // Handled by useEffect or direct interaction with controls
  }, []);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // resetControlsTimer(); // Handled by useEffect or direct interaction
  };

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      if (
        !options.selectedMusicId &&
        (MOCK_MUSIC_CATEGORIES[0]?.tracks[0] || MOCK_USER_MUSIC[0])
      ) {
        const firstTrack =
          MOCK_MUSIC_CATEGORIES[0]?.tracks[0] || MOCK_USER_MUSIC[0];
        if (firstTrack) {
          audioRef.current.src = firstTrack.audioSrc;
          setOptions((prev) => ({ ...prev, selectedMusicId: firstTrack.id }));
        }
      } else if (options.selectedMusicId) {
        const allTracks = [
          ...MOCK_MUSIC_CATEGORIES.flatMap((c) => c.tracks),
          ...MOCK_USER_MUSIC,
        ];
        const currentTrack = allTracks.find(
          (t) => t.id === options.selectedMusicId
        );
        if (currentTrack) audioRef.current.src = currentTrack.audioSrc;
      }
    }

    audioRef.current.muted = isMuted;
    audioRef.current.loop = options.autoLoopEnabled;

    if (options.musicEnabled && isPlaying && audioRef.current.src) {
      audioRef.current
        .play()
        .catch((e) => console.error("Error playing audio:", e));
    } else {
      audioRef.current.pause();
    }
  }, [
    options.musicEnabled,
    options.selectedMusicId,
    isPlaying,
    isMuted,
    options.autoLoopEnabled,
  ]);

  useEffect(() => {
    if (options.musicEnabled && !options.selectedMusicId && audioRef.current) {
      const firstAvailableTrack =
        MOCK_MUSIC_CATEGORIES.flatMap((c) => c.tracks)[0] || MOCK_USER_MUSIC[0];
      if (firstAvailableTrack) {
        handleMusicSelect(firstAvailableTrack);
      }
    }
  }, [options.musicEnabled, options.selectedMusicId, handleMusicSelect]);

  if (!slides || slides.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No slides to display.
      </div>
    );
  }

  const carouselButtonClasses = cn(
    "absolute top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 ease-in-out shadow-lg",
    "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
    controlsVisible && "opacity-100"
  );

  return (
    <>
      <div
        ref={playerRef}
        className="relative w-full h-full bg-neutral-900 overflow-hidden group"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          // If click is on background and controls are hidden, show them.
          // If click is on background and controls are visible, let timer hide them (or user interacts with controls).
          if (
            !target.closest(".player-controls-bar") &&
            !target.closest("[data-radix-popover-content]") &&
            !target.closest(".carousel-button")
          ) {
            if (!controlsVisible) showControlsAndResetTimer();
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault(); // Prevent default context menu
          showControlsAndResetTimer(); // Treat as activity
        }}
        onTouchStart={showControlsAndResetTimer} // Show controls on touch
      >
        {slides.map((slide, index) => (
          <Slide
            key={slide.id}
            slide={slide}
            isActive={index === currentIndex}
            onVideoEnded={
              slide.type === "video" && index === currentIndex
                ? handleNextSlide
                : undefined
            }
          />
        ))}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            handlePreviousSlide();
            showControlsAndResetTimer();
          }}
          className={cn(carouselButtonClasses, "left-4 carousel-button")}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            handleNextSlide();
            showControlsAndResetTimer();
          }}
          className={cn(carouselButtonClasses, "right-4 carousel-button")}
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
        </Button>

        <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={() => {
            handlePlayPause();
            showControlsAndResetTimer();
          }}
          onRestart={() => {
            handleRestart();
            showControlsAndResetTimer();
          }}
          currentSpeed={currentSpeed}
          onSpeedChange={(speed) => {
            handleSpeedChange(speed);
            showControlsAndResetTimer();
          }}
          isFullscreen={isFullscreen}
          onFullscreenToggle={() => {
            handleFullscreenToggle();
            showControlsAndResetTimer();
          }}
          isVisible={controlsVisible}
          options={options}
          setOptions={setOptions}
          onMusicSelect={(track) => {
            handleMusicSelect(track);
            showControlsAndResetTimer();
          }}
          isMuted={isMuted}
          onMuteToggle={() => {
            handleMuteToggle();
            showControlsAndResetTimer();
          }}
        />
      </div>
      {/* Exit button positioned on top of the player */}
      <Button
        variant="ghost"
        onClick={() => {
          setIsMuted(true);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          onExit();
        }}
        className="absolute top-4 left-4 z-50 text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm px-3 py-2 h-auto rounded-lg flex items-center space-x-1.5 transition-colors duration-150 shadow-lg"
        aria-label="Exit Slideshow"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="text-sm font-medium">Exit Slideshow</span>
      </Button>
    </>
  );
}
