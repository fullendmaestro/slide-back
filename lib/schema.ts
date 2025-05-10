import { z } from "zod";

export const memoryWizardSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt is required to set the theme of your slideshow.")
    .max(200, "Prompt is too long."),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .refine(
      (data) => {
        if (data.from && data.to) {
          return data.from <= data.to;
        }
        return true;
      },
      {
        message:
          "Start date must be before or on the same day as the end date.",
        path: ["to"],
      }
    ),
  album: z.string().optional(),
  mood: z.string().optional(),
  style: z.string().optional(),
  fileSources: z
    .object({
      photo: z.boolean(),
      video: z.boolean(),
    })
    .refine((data) => data.photo || data.video, {
      message: "Please select at least one file source (photos or videos).",
    }),
});

export type MemoryWizardData = z.infer<typeof memoryWizardSchema>;
