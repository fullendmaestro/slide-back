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
import Step4Music from "./Step4Music";
import Step5Options from "./Step5Options";
import { useMemoryStore } from "@/lib/stores/memoryStore";
import { useMemorySearch } from "@/lib/hooks/useMemory";
import { useAlbums } from "@/lib/hooks/useAlbums";
import Step6SlideBack from "./Step6SlideBack";

const TOTAL_STEPS = 6;

const stepTitles = [
  "Describe Your Memory",
  "Set Date Range",
  "Choose Albums",
  "Background Music",
  "Additional Options",
  "Slide BAck",
];

interface MemoryWizardFormProps {
  onSubmitForm: () => void;
}

export default function MemoryWizardForm() {
  const [currentStep, setCurrentStep] = useState(1);

  // Load albums for the album selection step
  const { data: albums } = useAlbums();

  // Memory store actions
  const setQuery = useMemoryStore((state) => state.setQuery);
  const setDateRange = useMemoryStore((state) => state.setDateRange);
  const setAlbumIds = useMemoryStore((state) => state.setAlbumIds);
  const setMusic = useMemoryStore((state) => state.setMusic);
  const setAiReview = useMemoryStore((state) => state.setAiReview);

  // Memory store state
  const setResults = useMemoryStore((state) => state.setResults);
  const setShowSlideshow = useMemoryStore((state) => state.setShowSlideshow);
  const setLoading = useMemoryStore((state) => state.setIsLoading);
  const isLoading = useMemoryStore((state) => state.isLoading);

  const form = useForm({
    resolver: zodResolver(memoryWizardSchema),
    defaultValues: {
      prompt: "",
      dateRange: { from: undefined, to: undefined },
      albums: [],
      music: {
        enabled: true,
        trackId: undefined,
        source: "default",
      },
      options: { photo: true, video: false, aiReview: false },
    },
    mode: "onChange",
  });

  const processSubmit: SubmitHandler<MemoryWizardData> = async (data) => {
    // Set the search parameters in the memory store
    setQuery(data.prompt);
    setDateRange(data.dateRange.from || null, data.dateRange.to || null);
    setAlbumIds(data.albums);
    setMusic(data.music);
    setAiReview(data.options.aiReview);

    try {
      setLoading(true);
      toast.success("Fetching Memories!", {
        description: "We are now searching your memories.",
      });

      const response = await fetch("/api/memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: data.prompt,
          dateRange: {
            from: data.dateRange.from
              ? data.dateRange.from.toISOString()
              : null,
            to: data.dateRange.to ? data.dateRange.to.toISOString() : null,
          },
          albumIds: data.albums,
          aiReview: data.options.aiReview,
        }),
      });

      if (!response.ok) {
        let errorMsg = "Failed to search memories";
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const results = await response.json();
      setResults(results);

      setShowSlideshow(true);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to create slideshow", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
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
        // Albums is optional, schema handles empty, but trigger to show potential specific errors if any
        isValid = await form.trigger("albums");
        break;
      case 4:
        // Music is optional, trigger to show potential specific errors if any
        isValid = await form.trigger("music");
        break;
      case 5:
        isValid = await form.trigger("options");
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
      else if (currentStep === 5 && errors.options)
        errorMessage =
          errors.options.message ||
          errors.options.root?.message ||
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
              {!isLoading ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="shadow-md px-6 py-3 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {currentStep === TOTAL_STEPS ? "Slide Back" : "Next"}{" "}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled
                  className="shadow-md px-6 py-3 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Loading
                </Button>
              )}
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
                {currentStep === 4 && <Step4Music form={form} />}
                {currentStep === 5 && <Step5Options form={form} />}
                {currentStep === 6 && (
                  <Step6SlideBack form={form} albums={albums || []} />
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Card>
  );
}
