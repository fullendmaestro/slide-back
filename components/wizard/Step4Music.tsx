"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { MemoryWizardData } from "@/lib/schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MOCK_MUSIC_CATEGORIES } from "@/lib/constants";
import { useAudioFiles } from "@/lib/hooks/useAudioFiles";
import { CheckCircle, Music, Search, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";

interface Step4MusicProps {
  form: any;
  // form: UseFormReturn<MemoryWizardData>;
}

export default function Step4Music({ form }: Step4MusicProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: userAudioFiles, isLoading } = useAudioFiles();

  // Get the current music values from the form
  const musicEnabled = form.watch("music.enabled");
  const musicSource = form.watch("music.source");
  const selectedTrackId = form.watch("music.trackId");

  // Filter user audio files based on search term
  const filteredUserAudio =
    userAudioFiles?.filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Handle track selection
  const handleTrackSelect = (trackId: string, source: "default" | "user") => {
    form.setValue("music.trackId", trackId, { shouldValidate: true });
    form.setValue("music.source", source, { shouldValidate: true });
    form.setValue("music.enabled", true, { shouldValidate: true });
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Background Music
        </CardTitle>
        <FormDescription>
          Choose music to accompany your slideshow.
        </FormDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="music.enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable Music</FormLabel>
                <FormDescription>
                  Play background music during your slideshow
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-readonly={field.disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {musicEnabled && (
          <Tabs
            defaultValue={musicSource}
            className="w-full"
            onValueChange={(value) =>
              form.setValue("music.source", value as "default" | "user", {
                shouldValidate: true,
              })
            }
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="default">Default Tracks</TabsTrigger>
              <TabsTrigger value="user">Your Uploads</TabsTrigger>
            </TabsList>

            <TabsContent value="default" className="mt-0">
              <ScrollArea className="h-[300px] pr-3">
                {MOCK_MUSIC_CATEGORIES.map((category) => (
                  <div key={category.id} className="mb-6">
                    <h4 className="font-semibold mb-2 text-muted-foreground">
                      {category.name}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {category.tracks.map((track) => (
                        <Button
                          key={track.id}
                          type="button"
                          variant="outline"
                          className={`h-auto p-2 flex flex-col items-center relative rounded-md transition-all duration-150 ease-in-out
                            ${
                              selectedTrackId === track.id
                                ? "ring-2 ring-primary bg-primary/10"
                                : "hover:bg-muted"
                            }`}
                          onClick={() => handleTrackSelect(track.id, "default")}
                        >
                          <div className="relative w-12 h-12 mb-2">
                            <Image
                              src={
                                track.thumbnailUrl ||
                                "/placeholder.svg?height=48&width=48"
                              }
                              alt={track.title}
                              fill
                              className="rounded-full object-cover"
                            />
                            {selectedTrackId === track.id && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                                <Volume2 className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs truncate w-full text-center">
                            {track.title}
                          </span>
                          {selectedTrackId === track.id && (
                            <CheckCircle className="absolute top-1 right-1 h-4 w-4 text-primary bg-background rounded-full" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="user" className="mt-0">
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search your music..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9"
                />
              </div>

              <ScrollArea className="h-[250px] pr-3">
                {isLoading ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Loading your audio files...
                  </p>
                ) : filteredUserAudio.length > 0 ? (
                  <div className="space-y-1">
                    {filteredUserAudio.map((file) => (
                      <Button
                        key={file.id}
                        type="button"
                        variant="ghost"
                        className={`w-full justify-start h-auto py-2 px-3 text-left relative rounded-md transition-all duration-150 ease-in-out
                          ${
                            selectedTrackId === file.id
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          }`}
                        onClick={() => handleTrackSelect(file.id, "user")}
                      >
                        <Music className="h-4 w-4 mr-3 shrink-0" />
                        <span className="flex-grow truncate">{file.name}</span>
                        {selectedTrackId === file.id && (
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 ml-2" />
                        )}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <VolumeX className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "No matching audio files found."
                        : "No audio files uploaded yet."}
                    </p>
                    <Button variant="outline" className="mx-auto">
                      Upload Audio Files
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
