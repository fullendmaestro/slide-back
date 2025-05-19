"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { MemoryWizardData } from "@/lib/schema";
import type { Album } from "@/lib/db/schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Step3AlbumProps {
  form: any;
  // form: UseFormReturn<MemoryWizardData>;
  albums: Album[];
}

export default function Step3Album({ form, albums }: Step3AlbumProps) {
  const [open, setOpen] = useState(false);
  const selectedAlbums = form.watch("albums") || [];

  const handleSelect = (albumId: string) => {
    const currentValues = form.getValues("albums") || [];

    // If already selected, remove it
    if (currentValues.includes(albumId)) {
      form.setValue(
        "albums",
        currentValues.filter((id) => id !== albumId)
      );
    } else {
      // Otherwise add it
      form.setValue("albums", [...currentValues, albumId]);
    }
  };

  const removeAlbum = (albumId: string) => {
    const currentValues = form.getValues("albums") || [];
    form.setValue(
      "albums",
      currentValues.filter((id) => id !== albumId)
    );
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Organize Your Memory
        </CardTitle>
        <FormDescription>
          Select one or more albums to include in your memory search.
        </FormDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="albums"
          render={({ field }) => (
            <FormItem className="flex flex-col-reverse">
              <FormLabel>Albums</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="justify-between w-full h-10 shadow-sm"
                    >
                      {selectedAlbums.length > 0
                        ? `${selectedAlbums.length} album${
                            selectedAlbums.length > 1 ? "s" : ""
                          } selected`
                        : "Select albums..."}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search albums..." />
                    <CommandList>
                      <CommandEmpty>No albums found.</CommandEmpty>
                      <CommandGroup>
                        {albums.map((album) => {
                          const isSelected = selectedAlbums.includes(album.id);
                          return (
                            <CommandItem
                              key={album.id}
                              value={album.id}
                              onSelect={() => handleSelect(album.id)}
                              className="flex items-center justify-between"
                            >
                              <span>{album.name}</span>
                              {isSelected && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedAlbums.length > 0 && (
                <ScrollArea className="w-full max-h-24 mt-2">
                  <div className="flex flex-wrap gap-2 p-1">
                    {selectedAlbums.map((albumId) => {
                      const album = albums.find((a) => a.id === albumId);
                      if (!album) return null;

                      return (
                        <Badge
                          key={albumId}
                          variant="secondary"
                          className="flex items-center gap-1 py-1 px-3"
                        >
                          {album.name}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                            onClick={() => removeAlbum(albumId)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {album.name}</span>
                          </Button>
                        </Badge>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}

              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
