import * as z from "zod";
import { DEFAULT_TEXTAREA_MAX_LENGTH } from "~~/utils/forms";

export const newStageModalFormSchema = z.object({
  milestone: z.string().min(20, { message: "At least 20 characters required" }).max(DEFAULT_TEXTAREA_MAX_LENGTH),
});

export type NewStageModalFormValues = z.infer<typeof newStageModalFormSchema>;
