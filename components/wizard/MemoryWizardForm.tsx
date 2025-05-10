"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memoryWizardSchema, type MemoryWizardData } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

import Step1Prompt from "./Step1Prompt";
import Step2DateRange from "./Step2DateRange";
import Step3Album from "./Step3Album";
import Step4MoodStyle from "./Step4MoodStyle";
import Step5FileSources from "./Step5FileSources";

const TOTAL_STEPS = 5;

export default function MemoryWizardForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(memoryWizardSchema),
    defaultValues: {
      prompt: "",
      dateRange: { from: undefined, to: undefined },
      album: "",
      mood: "",
      style: "",
      fileSources: { photo: true, video: false },
    },
    mode: "onChange", // Validate on change for better UX
  });

  const onSubmit: SubmitHandler<MemoryWizardData> = (data) => {
    console.log("Memory Wizard Data:", data);
  };

  const handleNext = async () => {
    let isValid = false;
    switch (currentStep) {
      case 1:
        isValid = await form.trigger("prompt");
        break;
      case 2:
        isValid = await form.trigger("dateRange");
        break;
      case 3:
        // Album is optional, so always valid unless specific rules apply
        isValid = true; // await form.trigger("album");
        break;
      case 4:
        // Mood and Style are optional
        isValid = true; // await form.trigger(["mood", "style"]);
        break;
      case 5:
        isValid = await form.trigger("fileSources");
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else if (isValid && currentStep === TOTAL_STEPS) {
      form.handleSubmit(onSubmit)();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const progressValue = (currentStep / TOTAL_STEPS) * 100;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          onSubmit as SubmitHandler<MemoryWizardData>
        )}
        className="space-y-8 p-2 sm:p-4"
      >
        <Progress value={progressValue} className="w-full mb-8 h-2" />

        {currentStep === 1 && <Step1Prompt form={form} />}
        {currentStep === 2 && <Step2DateRange form={form} />}
        {currentStep === 3 && <Step3Album form={form} />}
        {currentStep === 4 && <Step4MoodStyle form={form} />}
        {currentStep === 5 && <Step5FileSources form={form} />}

        <div className="flex pt-6 justify-between items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="shadow-sm"
          >
            Previous
          </Button>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {TOTAL_STEPS}
          </p>
          <Button
            type="button"
            onClick={handleNext}
            disabled={
              !form.formState.isValid &&
              currentStep ===
                1 /* Allow navigation if fields are optional for other steps */
            }
            className="shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {currentStep === TOTAL_STEPS ? "Create Slideshow" : "Next"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
