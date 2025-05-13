"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Step3AlbumProps {
  form: UseFormReturn<MemoryWizardData>;
  albums: Album[];
}

export default function Step3Album({ form, albums }: Step3AlbumProps) {
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Organize Your Memory
        </CardTitle>
        <FormDescription>
          Optionally, assign this memory to an album for better organization.
        </FormDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="album"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Album</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="Select an album (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {albums.map((album) => (
                    <SelectItem key={album.id} value={album.id}>
                      {album.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
