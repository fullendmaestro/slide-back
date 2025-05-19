"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Play,
  Pause,
  RotateCcw,
  Expand,
  Shrink,
  Settings2,
  FastForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { SlideshowOptions } from "./SlideshowPlayer"; // Import types
import SlideshowOptionsPanel from "./SlidesshowOptionsPanel";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onRestart: () => void;
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  isVisible: boolean;
  options: SlideshowOptions;
  setOptions: Dispatch<SetStateAction<SlideshowOptions>>;
  onMusicSelect: (track: any) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

const speedOptions = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
];

export default function PlayerControls({
  isPlaying,
  onPlayPause,
  onRestart,
  currentSpeed,
  onSpeedChange,
  isFullscreen,
  onFullscreenToggle,
  isVisible,
  options,
  setOptions,
  onMusicSelect,
  isMuted,
  onMuteToggle,
}: PlayerControlsProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="player-controls-bar absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur-lg p-1 text-white rounded-xl shadow-2xl transition-all duration-300 ease-in-out w-auto max-w-sm sm:max-w-md md:max-w-lg">
      {/* Main controls row */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 h-12">
        {/* Centered main controls */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRestart}
          title="Restart Slideshow"
          className="text-white hover:bg-white/20 hover:text-white"
        >
          <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onPlayPause}
          title={isPlaying ? "Pause" : "Play"}
          className="text-white hover:bg-white/20 hover:text-white mx-1 sm:mx-2"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 sm:h-8 sm:w-8" />
          ) : (
            <Play className="h-6 w-6 sm:h-8 sm:w-8" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMuteToggle}
          title={isMuted ? "Unmute" : "Mute"}
          className="text-white hover:bg-white/20 hover:text-white"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </Button>
        <Select
          value={currentSpeed.toString()}
          onValueChange={(value) => onSpeedChange(parseFloat(value))}
        >
          <SelectTrigger className="w-[70px] sm:w-[80px] h-8 sm:h-9 bg-transparent border-white/30 text-white hover:bg-white/10 focus:ring-primary">
            <FastForward className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <SelectValue placeholder="Speed" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
            {speedOptions.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value.toString()}
                className="focus:bg-primary focus:text-primary-foreground"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              title="Slideshow Options"
              className="text-white hover:bg-white/20 hover:text-white"
            >
              <Settings2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-80 bg-neutral-800 border-neutral-700 text-white p-0 shadow-2xl rounded-lg"
            onInteractOutside={(e) => {
              // Allow clicks within the player controls bar or popover itself
              const target = e.target as HTMLElement;
              if (
                target?.closest(".player-controls-bar") ||
                target?.closest(
                  '[data-radix-popover-content][data-state="open"]'
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            <SlideshowOptionsPanel
              options={options}
              setOptions={setOptions}
              onMusicSelect={onMusicSelect}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="icon"
          onClick={onFullscreenToggle}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          className="text-white hover:bg-white/20 hover:text-white"
        >
          {isFullscreen ? (
            <Shrink className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <Expand className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </Button>
      </div>
    </div>
  );
}
