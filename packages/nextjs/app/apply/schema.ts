import * as z from "zod";
import { DEFAULT_INPUT_MAX_LENGTH, DEFAULT_TEXTAREA_MAX_LENGTH } from "~~/utils/forms";

export const applyFormSchema = z.object({
  title: z.string().min(1, { message: "Required" }).max(DEFAULT_INPUT_MAX_LENGTH),
  description: z.string().min(20, { message: "At least 20 characters required" }).max(DEFAULT_TEXTAREA_MAX_LENGTH),
  milestones: z.string().min(20, { message: "At least 20 characters required" }).max(DEFAULT_TEXTAREA_MAX_LENGTH),
  showcaseVideoUrl: z.string().max(DEFAULT_INPUT_MAX_LENGTH).optional(),
  requestedFunds: z.string().max(DEFAULT_INPUT_MAX_LENGTH),
  github: z.string().min(1, { message: "Required" }).max(DEFAULT_INPUT_MAX_LENGTH),
  email: z.string().email().max(DEFAULT_INPUT_MAX_LENGTH),
  twitter: z.string().max(DEFAULT_INPUT_MAX_LENGTH).optional(),
  telegram: z.string().max(DEFAULT_INPUT_MAX_LENGTH).optional(),
});

export type ApplyFormValues = z.infer<typeof applyFormSchema>;
