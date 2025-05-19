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
  albums: z.array(z.string()).default([]),
  music: z
    .object({
      enabled: z.boolean().default(true),
      trackId: z.string().optional(),
      source: z.enum(["default", "user"]).default("default"),
    })
    .default({
      enabled: true,
      trackId: undefined,
      source: "default",
    }),
  options: z
    .object({
      photo: z.boolean().default(true),
      video: z.boolean().default(false),
      aiReview: z.boolean().default(false),
    })
    .refine((data) => data.photo || data.video, {
      message: "Please select at least one file source (photos or videos).",
    }),
});

export type MemoryWizardData = z.infer<typeof memoryWizardSchema>;
