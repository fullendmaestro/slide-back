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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Step1PromptProps {
  form: UseFormReturn<MemoryWizardData>;
}

export default function Step1Prompt({ form }: Step1PromptProps) {
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Describe Your Memory
        </CardTitle>
        <FormDescription>
          What memory would you like to slide back to today?
        </FormDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Memory Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Summer vacation in Italy, 2023"
                  className="min-h-[100px] resize-none shadow-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
