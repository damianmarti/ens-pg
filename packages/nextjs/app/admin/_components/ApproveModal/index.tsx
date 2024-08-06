import { forwardRef } from "react";
import { ApproveModalFormValues, approveModalFormSchema } from "./schema";
import { FormProvider } from "react-hook-form";
import { Button } from "~~/components/pg-ens/Button";
import { FormInput } from "~~/components/pg-ens/form-fields/FormInput";
import { FormTextarea } from "~~/components/pg-ens/form-fields/FormTextarea";
import { useFormMethods } from "~~/hooks/pg-ens/useFormMethods";
import { useStageReview } from "~~/hooks/pg-ens/useStageReview";
import { Stage } from "~~/services/database/repositories/stages";

export const ApproveModal = forwardRef<HTMLDialogElement, { stage: Stage; grantName: string }>(
  ({ stage, grantName }, ref) => {
    const { reviewStage, isSigning, isPostingStageReview } = useStageReview(stage.id);

    const { formMethods, getCommonOptions } = useFormMethods<ApproveModalFormValues>({
      schema: approveModalFormSchema,
    });
    const { handleSubmit } = formMethods;

    const onSubmit = async (fieldValues: ApproveModalFormValues) => {
      await reviewStage({ status: "approved", ...fieldValues });
    };

    return (
      <dialog id="action_modal" className="modal" ref={ref}>
        <div className="modal-box flex flex-col space-y-3">
          <form method="dialog" className="bg-secondary -mx-6 -mt-6 px-6 py-4 flex items-center justify-between">
            <div className="flex justify-between items-center">
              <p className="font-bold text-xl m-0">
                Approve Stage {stage.stageNumber} for {grantName}
              </p>
            </div>
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost text-xl h-auto">✕</button>
          </form>
          <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col space-y-1">
              <FormInput
                label={`Grant amount for stage ${stage.stageNumber} (in ETH)`}
                {...getCommonOptions("grantAmount")}
              />
              <FormTextarea label="Note (visible to grantee)" {...getCommonOptions("statusNote")} />
              <FormInput label="Tx hash" {...getCommonOptions("txHash")} />
              <Button
                variant="green"
                type="submit"
                disabled={isPostingStageReview || isSigning}
                className="self-center"
              >
                {(isPostingStageReview || isSigning) && <span className="loading loading-spinner"></span>}
                Approve
              </Button>
            </form>
          </FormProvider>
        </div>
      </dialog>
    );
  },
);

ApproveModal.displayName = "ApproveModal";
