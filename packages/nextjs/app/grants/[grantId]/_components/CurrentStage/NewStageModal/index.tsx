import { forwardRef } from "react";
import { useRouter } from "next/navigation";
import { NewStageModalFormValues, newStageModalFormSchema } from "./schema";
import { useMutation } from "@tanstack/react-query";
import { FormProvider } from "react-hook-form";
import { useSignTypedData } from "wagmi";
import { CreateNewStageReqBody } from "~~/app/api/stages/new/route";
import { Button } from "~~/components/pg-ens/Button";
import { FormTextarea } from "~~/components/pg-ens/form-fields/FormTextarea";
import { useFormMethods } from "~~/hooks/pg-ens/useFormMethods";
import { Grant } from "~~/services/database/repositories/grants";
import { Stage } from "~~/services/database/repositories/stages";
import { EIP_712_DOMAIN, EIP_712_TYPES__APPLY_FOR_STAGE } from "~~/utils/eip712";
import { postMutationFetcher } from "~~/utils/react-query";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

type NewStageModalProps = {
  grantId: Grant["id"];
  closeModal: () => void;
  previousStage: Stage;
};

export const NewStageModal = forwardRef<HTMLDialogElement, NewStageModalProps>(
  ({ grantId, closeModal, previousStage }, ref) => {
    const { formMethods, getCommonOptions } = useFormMethods<NewStageModalFormValues>({
      schema: newStageModalFormSchema,
    });
    const { handleSubmit } = formMethods;

    const onSubmit = async (fieldValues: NewStageModalFormValues) => {
      try {
        const milestone = fieldValues.milestone;

        const signature = await signTypedDataAsync({
          domain: EIP_712_DOMAIN,
          types: EIP_712_TYPES__APPLY_FOR_STAGE,
          primaryType: "Message",
          message: {
            stage_number: (previousStage.stageNumber + 1).toString(),
            milestone: milestone,
          },
        });

        await postNewStage({ milestone, signature, grantId });
        closeModal();
        router.refresh();
      } catch (error) {
        const errorMessage = getParsedError(error);
        notification.error(errorMessage);
      }
    };
    const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();
    const router = useRouter();

    const { mutateAsync: postNewStage, isPending: isPostingNewStage } = useMutation({
      mutationFn: (newStageBody: CreateNewStageReqBody) =>
        postMutationFetcher("/api/stages/new", { body: newStageBody }),
    });

    return (
      <dialog id="action_modal" className="modal" ref={ref}>
        <div className="modal-box flex flex-col space-y-3">
          <form method="dialog" className="bg-secondary -mx-6 -mt-6 px-6 py-4 flex items-center justify-between">
            <div className="flex justify-between items-center">
              <p className="font-bold text-xl m-0">Stage {previousStage.stageNumber + 1} application</p>
            </div>
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost text-xl h-auto">✕</button>
          </form>
          <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col">
              <FormTextarea label="Stage milestones" showMessageLength {...getCommonOptions("milestone")} />
              <Button
                variant="green"
                type="submit"
                disabled={isPostingNewStage || isSigning}
                className="self-center mt-4"
              >
                {(isPostingNewStage || isSigning) && <span className="loading loading-spinner"></span>}
                Apply for a grant
              </Button>
            </form>
          </FormProvider>
        </div>
      </dialog>
    );
  },
);

NewStageModal.displayName = "NewStageModal";
