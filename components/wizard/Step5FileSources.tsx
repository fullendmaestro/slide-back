"use client";

import type { UseFormReturn } from "react-hook-form";
import type { MemoryWizardData } from "@/lib/schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon, Video } from "lucide-react";

interface Step5FileSourcesProps {
  form: UseFormReturn<MemoryWizardData>;
}

export default function Step5FileSources({ form }: Step5FileSourcesProps) {
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          What Are You Including?
        </CardTitle>
        <FormDescription>
          Specify the types of media you&apos;ll be using in your slideshow.
        </FormDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="fileSources.photo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm hover:shadow-md transition-shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-0.5 leading-none">
                <FormLabel className="font-medium cursor-pointer flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5 text-primary" /> Photos
                </FormLabel>
                <FormDescription>
                  Include still images in your slideshow.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fileSources.video"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm hover:shadow-md transition-shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-0.5 leading-none">
                <FormLabel className="font-medium cursor-pointer flex items-center">
                  <Video className="mr-2 h-5 w-5 text-primary" /> Videos
                </FormLabel>
                <FormDescription>
                  Include video clips in your slideshow.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        {/* Combined error message for the fileSources object */}
        {form.formState.errors.fileSources &&
          !form.formState.errors.fileSources.photo &&
          !form.formState.errors.fileSources.video && (
            <FormMessage>
              {form.formState.errors.fileSources.message}
            </FormMessage>
          )}
      </CardContent>
    </Card>
  );
}
