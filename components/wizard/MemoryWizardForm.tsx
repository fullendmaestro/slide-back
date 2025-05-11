"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memoryWizardSchema, type MemoryWizardData } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner"; // Updated to use sonner
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Wand2 } from "lucide-react";

import Step1Prompt from "./Step1Prompt";
import Step2DateRange from "./Step2DateRange";
import Step3Album from "./Step3Album";
import Step4MoodStyle from "./Step4MoodStyle";
import Step5FileSources from "./Step5FileSources";

const TOTAL_STEPS = 5;

const stepTitles = [
  "Describe Your Memory",
  "Set Date Range",
  "Choose Album",
  "Select Mood & Style",
  "Specify Media Types",
];

export default function MemoryWizardForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

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

  const onSubmit: SubmitHandler<MemoryWizardData> = (data) => {
    console.log("Memory Wizard Data:", data);
    toast.success("Slideshow creation process started!", {
      description:
        "We've received your preferences and will begin generating your slideshow.",
    });
    // Dummy navigation to slideshow page for now
    // In a real app, you might wait for generation and then navigate
    router.push("/slideshow/mock");
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
        isValid = await form.trigger("album");
        break;
      case 4:
        isValid = await form.trigger(["mood", "style"]);
        break;
      case 5:
        isValid = await form.trigger("fileSources");
        break;
      default:
        isValid = true; // Should not happen
    }

    const isStepValidBasedOnTrigger = isValid;
    const isFormOverallValid = form.formState.isValid;

    if (
      (currentStep === 1 && isFormOverallValid) ||
      (currentStep > 1 && isStepValidBasedOnTrigger)
    ) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((prev) => prev + 1);
      } else {
        form.handleSubmit(onSubmit)();
      }
    } else {
      const firstError = Object.values(form.formState.errors)[0];
      let errorMessage = "Please fill in the required fields correctly.";
      if (firstError && typeof firstError.message === "string") {
        errorMessage = firstError.message;
      } else if (
        firstError &&
        firstError.root &&
        typeof firstError.root.message === "string"
      ) {
        errorMessage = firstError.root.message;
      }

      toast.error("Validation Error", {
        description:
          errorMessage || "Check the highlighted fields and try again.",
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
                {currentStep === TOTAL_STEPS ? "Create Slideshow" : "Next"}
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
                {currentStep === 3 && <Step3Album form={form} />}
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
