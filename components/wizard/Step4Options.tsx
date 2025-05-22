"use client";

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
import { ImageIcon, Video, Sparkles } from "lucide-react";

interface Step5OptionsProps {
  form: any;
  // form: UseFormReturn<MemoryWizardData>;
}

export default function Step5Options({ form }: Step5OptionsProps) {
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Additional Options
        </CardTitle>
        <FormDescription>
          Customize your memory search with these additional settings.
        </FormDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Media Types</h3>
          <FormField
            control={form.control}
            name="options.photo"
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
            name="options.video"
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
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">AI Enhancement</h3>
          <FormField
            control={form.control}
            name="options.aiReview"
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
                    <Sparkles className="mr-2 h-5 w-5 text-primary" /> AI Review
                  </FormLabel>
                  <FormDescription>
                    Use AI to review search results for accuracy and relevance
                    to your prompt.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Combined error message for the options object */}
        {form.formState.errors.options && (
          <FormMessage>{form.formState.errors.options.message}</FormMessage>
        )}
      </CardContent>
    </Card>
  );
}
