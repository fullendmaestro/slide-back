"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
}

export default function SlideshowPlayer({ slides }: SlideshowPlayerProps) {
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
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlideDuration =
    (slides[currentIndex]?.duration || DEFAULT_IMAGE_DURATION) / currentSpeed;

  const resetControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    setControlsVisible(true);

    // Only set timer to hide controls if playing and not manually paused,
    // or if in fullscreen (where inactivity should always hide controls).
    // If a popover is open (part of controls), don't hide. This check is implicitly handled by any interaction resetting the timer.
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => {
        // Check if a popover is active before hiding. This is a bit tricky
        // as popover state is in PlayerControls. A simpler approach: any interaction resets.
        // If a settings popover is open, user is interacting, so timer will be reset.
        const isPopoverOpen = playerRef.current?.querySelector(
          '[data-radix-popover-content][data-state="open"]'
        );
        if (!isPopoverOpen) {
          setControlsVisible(false);
        }
      }, 3000); // Hide after 3 seconds of inactivity
    }
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [resetControlsTimer, currentIndex, isPlaying, isFullscreen]);

  const handleNextSlide = useCallback(() => {
    if (!options.autoLoopEnabled && currentIndex === slides.length - 1) {
      setIsPlaying(false);
      setProgress(currentSlideDuration);
      resetControlsTimer();
      return;
    }
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    setProgress(0);
    resetControlsTimer();
  }, [
    slides.length,
    options.autoLoopEnabled,
    currentIndex,
    currentSlideDuration,
    resetControlsTimer,
  ]);

  const handlePreviousSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
    setProgress(0);
    resetControlsTimer();
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
    <div
      ref={playerRef}
      className="relative w-full h-full bg-neutral-900 overflow-hidden group"
      onMouseMove={resetControlsTimer}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        // If click is on background and controls are hidden, show them.
        // If click is on background and controls are visible, let timer hide them (or user interacts with controls).
        if (
          !target.closest(".player-controls-bar") &&
          !target.closest("[data-radix-popover-content]") &&
          !target.closest(".carousel-button")
        ) {
          if (!controlsVisible) resetControlsTimer();
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault(); // Prevent default context menu
        resetControlsTimer(); // Treat as activity
      }}
      onTouchStart={resetControlsTimer} // Show controls on touch
    >
      {slides.map((slide, index) => (
        <Slide key={slide.id} slide={slide} isActive={index === currentIndex} />
      ))}

      <Button
        variant="ghost"
        size="icon"
        onClick={handlePreviousSlide}
        className={cn(carouselButtonClasses, "left-4 carousel-button")}
        aria-label="Previous slide"
        // Prevent clicks on buttons from bubbling up to the main div's onClick if it were to toggle controls
        // onClickCapture={(e) => e.stopPropagation()}
      >
        <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNextSlide}
        className={cn(carouselButtonClasses, "right-4 carousel-button")}
        aria-label="Next slide"
        // onClickCapture={(e) => e.stopPropagation()}
      >
        <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
      </Button>

      <PlayerControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onRestart={handleRestart}
        currentSpeed={currentSpeed}
        onSpeedChange={handleSpeedChange}
        isFullscreen={isFullscreen}
        onFullscreenToggle={handleFullscreenToggle}
        isVisible={controlsVisible}
        options={options}
        setOptions={setOptions}
        onMusicSelect={handleMusicSelect}
        isMuted={isMuted}
        onMuteToggle={handleMuteToggle}
      />
    </div>
  );
}
