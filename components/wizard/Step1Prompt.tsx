"use client";

import type { UseFormReturn } from "react-hook-form";
import type { MemoryWizardData } from "@/lib/schema";
import { FormField } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemoryPromptInput } from "./ai-input/MemoryPromptInput";

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
        <p className="text-sm text-muted-foreground">
          What memory would you like to slide back to today?
        </p>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => <MemoryPromptInput field={field} />}
        />
      </CardContent>
    </Card>
  );
}
