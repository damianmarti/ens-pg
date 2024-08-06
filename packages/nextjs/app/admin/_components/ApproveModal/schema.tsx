import * as z from "zod";
import { DEFAULT_TEXTAREA_MAX_LENGTH } from "~~/utils/forms";

export const approveModalFormSchema = z.object({
  grantAmount: z.string().refine(val => Number(val) > 0, {
    message: "Enter valid number",
  }),
  statusNote: z.string().max(DEFAULT_TEXTAREA_MAX_LENGTH).optional(),
  txHash: z.string(),
  // TODO uncomment before release, inconvenient to test
  // .length(66),
});

export type ApproveModalFormValues = z.infer<typeof approveModalFormSchema>;
