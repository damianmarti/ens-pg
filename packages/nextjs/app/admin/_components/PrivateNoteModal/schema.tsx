import * as z from "zod";
import { DEFAULT_TEXTAREA_MAX_LENGTH } from "~~/utils/forms";

export const privateNoteModalFormSchema = z.object({
  note: z.string().min(1, { message: "Required" }).max(DEFAULT_TEXTAREA_MAX_LENGTH),
});

export type PrivateNoteModalFormValues = z.infer<typeof privateNoteModalFormSchema>;
