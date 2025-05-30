"use client";
import Image from "next/image";
import { useState, type Dispatch, type SetStateAction } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MOCK_MUSIC_CATEGORIES,
  MOCK_USER_MUSIC,
  type MusicTrack,
  type MusicCategory,
} from "@/lib/constants";
import type { SlideshowOptions } from "./SlideshowPlayer";
import { CheckCircle, Music, Search, UploadCloud } from "lucide-react";

interface SlideshowOptionsPanelProps {
  options: SlideshowOptions;
  setOptions: Dispatch<SetStateAction<SlideshowOptions>>;
  onMusicSelect: (track: MusicTrack) => void;
}

export default function SlideshowOptionsPanel({
  options,
  setOptions,
  onMusicSelect,
}: SlideshowOptionsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleOptionChange = (
    optionKey: keyof SlideshowOptions,
    value: boolean
  ) => {
    setOptions((prev) => ({ ...prev, [optionKey]: value }));
  };

  const filteredUserMusic = MOCK_USER_MUSIC.filter((track) =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMusicTrackSelect = (track: MusicTrack) => {
    onMusicSelect(track);
    setOptions((prev) => ({
      ...prev,
      selectedMusicId: track.id,
      musicEnabled: true,
    }));
  };

  return (
    <div className="p-4 text-sm text-white">
      <h3 className="text-lg font-semibold mb-4 text-center">
        Slideshow Options
      </h3>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="animations-switch">Animations</Label>
          <Switch
            id="animations-switch"
            checked={options.animationsEnabled}
            onCheckedChange={(checked) =>
              handleOptionChange("animationsEnabled", checked)
            }
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-neutral-600 [&>span]:bg-neutral-300"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="transitions-switch">Transitions</Label>
          <Switch
            id="transitions-switch"
            checked={options.transitionsEnabled}
            onCheckedChange={(checked) =>
              handleOptionChange("transitionsEnabled", checked)
            }
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-neutral-600 [&>span]:bg-neutral-300"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="autoloop-switch">Auto Loop</Label>
          <Switch
            id="autoloop-switch"
            checked={options.autoLoopEnabled}
            onCheckedChange={(checked) =>
              handleOptionChange("autoLoopEnabled", checked)
            }
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-neutral-600 [&>span]:bg-neutral-300"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="music-switch">Music</Label>
          <Switch
            id="music-switch"
            checked={options.musicEnabled}
            onCheckedChange={(checked) =>
              handleOptionChange("musicEnabled", checked)
            }
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-neutral-600 [&>span]:bg-neutral-300"
          />
        </div>
      </div>

      {options.musicEnabled && (
        <div className="mt-4 pt-4 border-t border-neutral-700">
          <ScrollArea className="h-[250px] pr-3">
            {MOCK_MUSIC_CATEGORIES.map((category) => (
              <div key={category.id} className="mb-4">
                <h4 className="font-semibold mb-2 text-neutral-300">
                  {category.name}
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {category.tracks.map((track) => (
                    <Button
                      key={track.id}
                      variant="ghost"
                      className={`h-auto p-1.5 flex flex-col items-center relative rounded-md transition-all duration-150 ease-in-out
                        ${
                          options.selectedMusicId === track.id
                            ? "ring-2 ring-primary bg-primary/20"
                            : "hover:bg-neutral-700/80"
                        }`}
                      onClick={() => handleMusicTrackSelect(track)}
                      title={track.title}
                    >
                      <Image
                        src={track.thumbnailUrl}
                        alt={track.title}
                        width={48}
                        height={48}
                        className="rounded-full object-cover mb-1"
                        data-ai-hint={track.dataAiHint || "music album"}
                      />
                      <span className="text-xs truncate w-full text-center text-neutral-300">
                        {track.title}
                      </span>
                      {options.selectedMusicId === track.id && (
                        <CheckCircle className="absolute top-1 right-1 h-4 w-4 text-primary bg-neutral-800 rounded-full" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
