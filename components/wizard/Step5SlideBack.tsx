"use client";

import type { UseFormReturn } from "react-hook-form";
import type { MemoryWizardData } from "@/lib/schema";
import { FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, Video, Sparkles, Music } from "lucide-react";
import { Album } from "@/lib/db/schema";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface Step6SlideBackProps {
  form: any;
  albums: Album[];
  // form: UseFormReturn<MemoryWizardData>;
}

export default function Step6SlideBack({ form, albums }: Step6SlideBackProps) {
  // Get all values from the form
  const values = form.getValues();

  // Helper for formatting date
  const formatDate = (date?: Date) =>
    date ? new Date(date).toLocaleDateString() : "—";

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Review Your Selections
        </CardTitle>
        <FormDescription>
          Please review your settings before continuing.
        </FormDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Prompt */}
          <div>
            <h3 className="text-sm font-medium mb-1">Prompt</h3>
            <div className="text-base text-muted-foreground truncate">
              {values.prompt || (
                <span className="italic text-muted-foreground">
                  No prompt provided.
                </span>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h3 className="text-sm font-medium mb-1">Date Range</h3>
            <div className="text-base text-muted-foreground">
              {formatDate(values.dateRange?.from)} &rarr;{" "}
              {formatDate(values.dateRange?.to)}
            </div>
          </div>

          {/* Albums */}
          <div>
            <h3 className="text-sm font-medium mb-1">Albums</h3>
            <div className="text-base text-muted-foreground">
              {values.albums && values.albums.length > 0 ? (
                <ScrollArea className="w-full max-h-16">
                  <div className="flex flex-wrap gap-2">
                    {values.albums.map((albumId) => {
                      const album = albums.find((a) => a.id === albumId);
                      if (!album) return null;
                      return (
                        <Badge
                          key={albumId}
                          variant="secondary"
                          className="flex items-center gap-1 py-0.5 px-2 text-xs"
                        >
                          {album.name}
                        </Badge>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <span className="italic text-muted-foreground">All albums</span>
              )}
            </div>
          </div>

          {/* Music */}
          <div>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-1">
              <Music className="h-4 w-4" /> Music
            </h3>
            <div className="text-base text-muted-foreground">
              {values.music?.enabled
                ? `Enabled (${
                    values.music.source === "user"
                      ? "Your Upload"
                      : "Default Track"
                  })`
                : "Disabled"}
            </div>
          </div>

          {/* Media Types */}
          <div>
            <h3 className="text-sm font-medium mb-1">Media Types</h3>
            <div className="flex gap-4 text-base text-muted-foreground">
              <span className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                {values.options?.photo ? (
                  "Photos"
                ) : (
                  <span className="line-through">Photos</span>
                )}
              </span>
              <span className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                {values.options?.video ? (
                  "Videos"
                ) : (
                  <span className="line-through">Videos</span>
                )}
              </span>
            </div>
          </div>

          {/* AI Enhancement */}
          <div>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4" /> AI Enhancement
            </h3>
            <div className="text-base text-muted-foreground">
              {values.options?.aiReview ? "Enabled" : "Disabled"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// export default function Step6SlideBack({ form }: Step6SlideBackProps) {
//   return (
//     <Card className="border-none shadow-none">
//       <CardHeader>
//         <CardTitle className="text-xl font-semibold">Slide Back</CardTitle>
//         <FormDescription>
//           Now lets resurface those memories back.
//         </FormDescription>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <div className="space-y-4">
//           <h3 className="text-sm font-medium">Prompt</h3>
//           <p></p>
//         </div>

//         <div className="space-y-4">
//           <h3 className="text-sm font-medium">AI Enhancement</h3>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
