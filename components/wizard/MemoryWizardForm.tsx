"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memoryWizardSchema, type MemoryWizardData } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

import Step1Prompt from "./Step1Prompt";
import Step2DateRange from "./Step2DateRange";
import Step3Album from "./Step3Album";
import Step4MoodStyle from "./Step4MoodStyle";
import Step5FileSources from "./Step5FileSources";
import { useMemoryStore } from "@/lib/stores/memoryStore";
import { useMemorySearch } from "@/lib/hooks/useMemory";
import { useAlbums } from "@/lib/hooks/useAlbums";

const TOTAL_STEPS = 5;

const stepTitles = [
  "Describe Your Memory",
  "Set Date Range",
  "Choose Album",
  "Select Mood & Style",
  "Specify Media Types",
];

interface MemoryWizardFormProps {
  onSubmitForm: (data: MemoryWizardData) => void;
}

export default function MemoryWizardForm({
  onSubmitForm,
}: MemoryWizardFormProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // Load albums for the album selection step
  const { data: albums } = useAlbums();

  // Memory store actions
  const setQuery = useMemoryStore((state) => state.setPrompt);
  const setDateRange = useMemoryStore((state) => state.setDateRange);
  const setAlbumId = useMemoryStore((state) => state.setAlbumId);

  // Memory search query
  const memorySearch = useMemorySearch();

  const form = useForm<MemoryWizardData>({
    resolver: zodResolver(memoryWizardSchema),
    defaultValues: {
      prompt: "",
      dateRange: { from: undefined, to: undefined },
      album: "",
      mood: "",
      style: "",
      fileSources: { photo: true, video: false },
    },
    mode: "onChange",
  });

  const processSubmit: SubmitHandler<MemoryWizardData> = (data) => {
    console.log("Memory Wizard Data:", data);

    // Set the search parameters in the memory store
    setQuery(data.prompt);
    setDateRange({
      from: data.dateRange.from || undefined,
      to: data.dateRange.to || undefined,
    });
    setAlbumId(data.album || null);

    // Trigger the search
    memorySearch
      .refetch()
      .then(() => {
        toast.success("Slideshow preferences saved!", {
          description: "Your slideshow is ready to view.",
        });
        onSubmitForm(data);
      })
      .catch((error) => {
        toast.error("Failed to create slideshow", {
          description:
            error instanceof Error ? error.message : "Please try again.",
        });
      });
  };

  const handleNext = async () => {
    let isValid = false;
    // Trigger validation for current step's fields
    switch (currentStep) {
      case 1:
        isValid = await form.trigger("prompt");
        break;
      case 2:
        isValid = await form.trigger("dateRange");
        break;
      case 3:
        // Album is optional, schema handles empty, but trigger to show potential specific errors if any
        isValid = await form.trigger("album");
        break;
      case 4:
        // Mood and Style are optional, trigger to show potential specific errors if any
        isValid = await form.trigger(["mood", "style"]);
        break;
      case 5:
        isValid = await form.trigger("fileSources");
        break;
      default:
        isValid = true; // Should not happen
    }

    const isStepValidBasedOnTrigger = isValid;
    // form.formState.isValid reflects the entire form, which might not be what we want mid-wizard
    // We rely on per-step trigger usually. For the last step, it's a full submit.

    if (isStepValidBasedOnTrigger) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((prev) => prev + 1);
      } else {
        form.handleSubmit(processSubmit)(); // This will call the main processSubmit
      }
    } else {
      const errors = form.formState.errors;
      let errorMessage = "Please fill in the required fields correctly.";

      if (currentStep === 1 && errors.prompt)
        errorMessage = errors.prompt.message || errorMessage;
      else if (currentStep === 2 && errors.dateRange?.to)
        errorMessage = errors.dateRange.to.message || errorMessage;
      // Prioritize 'to' for range errors
      else if (currentStep === 2 && errors.dateRange?.from)
        errorMessage = errors.dateRange.from.message || errorMessage;
      else if (currentStep === 5 && errors.fileSources)
        errorMessage =
          errors.fileSources.message ||
          errors.fileSources.root?.message ||
          errorMessage;

      toast.error("Validation Error", {
        description: errorMessage,
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const progressValue = (currentStep / TOTAL_STEPS) * 100;

  return (
    <Card className="w-full max-w-5xl shadow-2xl rounded-xl overflow-hidden p-0">
      <div className="flex flex-col md:flex-row">
        {/* Left Pane */}
        <div className="md:w-2/5 bg-muted/30 p-8 border-r border-border flex flex-col">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary/10 p-3 rounded-lg ring-1 ring-primary/20">
                <Wand2 className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Hello, Nick
              </h1>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed">
              What memories would you like to slide back to today?
            </p>
          </div>

          <div className="mt-auto space-y-6 pt-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-md font-semibold text-foreground">
                Step {currentStep}: {stepTitles[currentStep - 1]}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                {currentStep} / {TOTAL_STEPS}
              </p>
            </div>
            <Progress value={progressValue} className="h-2.5 rounded-full" />
            <div className="flex justify-between items-center mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="shadow-md px-6 py-3 text-base"
              >
                Previous
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="shadow-md px-6 py-3 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {currentStep === TOTAL_STEPS ? "Slide Back" : "Next"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Pane */}
        <div className="md:w-3/5 p-8 flex-grow bg-card">
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNext();
              }}
              className="h-full flex flex-col"
            >
              <div className="flex-grow space-y-8">
                {currentStep === 1 && <Step1Prompt form={form} />}
                {currentStep === 2 && <Step2DateRange form={form} />}
                {currentStep === 3 && (
                  <Step3Album form={form} albums={albums || []} />
                )}
                {currentStep === 4 && <Step4MoodStyle form={form} />}
                {currentStep === 5 && <Step5FileSources form={form} />}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Card>
  );
}
