import * as z from "zod";
import { DEFAULT_TEXTAREA_MAX_LENGTH } from "~~/utils/forms";

export const withdrawModalFormSchema = z.object({
  // TODO: get possible amount from contract
  withdrawAmount: z.string().refine(val => Number(val) > 0, {
    message: "Enter valid number",
  }),
  completedMilestones: z
    .string()
    .min(20, { message: "At least 20 characters required" })
    .max(DEFAULT_TEXTAREA_MAX_LENGTH),
});

export type WithdrawModalFormValues = z.infer<typeof withdrawModalFormSchema>;
