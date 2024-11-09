import * as z from "zod";

export const approvalVoteModalFormSchema = z.object({
  grantAmount: z.string().refine(val => Number(val) > 0, {
    message: "Enter valid number",
  }),
});

export type ApprovalVoteModalFormValues = z.infer<typeof approvalVoteModalFormSchema>;
