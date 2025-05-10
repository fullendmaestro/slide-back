"use client";

import type { UseFormReturn } from "react-hook-form";
import type { MemoryWizardData } from "@/lib/schema";
import { MOODS, STYLES } from "@/lib/constants";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Step4MoodStyleProps {
  form: UseFormReturn<MemoryWizardData>;
}

export default function Step4MoodStyle({ form }: Step4MoodStyleProps) {
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Set the Vibe</CardTitle>
        <FormDescription>
          Choose a mood and style to personalize your slideshow. These are
          optional.
        </FormDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-md font-medium">Mood</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {MOODS.map((mood) => (
                    <FormItem
                      key={mood.id}
                      className="flex items-center space-x-3 space-y-0 p-3 rounded-md border border-input hover:border-primary transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                    >
                      <FormControl>
                        <RadioGroupItem value={mood.id} />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer flex-grow">
                        {mood.name}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="style"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-md font-medium">Style</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {STYLES.map((style) => (
                    <FormItem
                      key={style.id}
                      className="flex items-center space-x-3 space-y-0 p-3 rounded-md border border-input hover:border-primary transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                    >
                      <FormControl>
                        <RadioGroupItem value={style.id} />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer flex-grow">
                        {style.name}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
