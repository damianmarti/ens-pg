import { forwardRef, useState } from "react";
import { GrantWithStagesAndPrivateNotes } from "../Proposal";
import { FinalApproveModalFormValues, finalApproveModalFormSchema } from "./schema";
import { FormProvider } from "react-hook-form";
import { Toaster } from "react-hot-toast";
import { formatEther, parseEther } from "viem";
import { Button } from "~~/components/pg-ens/Button";
import { FormInput } from "~~/components/pg-ens/form-fields/FormInput";
import { FormTextarea } from "~~/components/pg-ens/form-fields/FormTextarea";
import { Address } from "~~/components/scaffold-eth";
import { useFormMethods } from "~~/hooks/pg-ens/useFormMethods";
import { useStageReview } from "~~/hooks/pg-ens/useStageReview";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const FinalApproveModal = forwardRef<
  HTMLDialogElement,
  {
    stage: GrantWithStagesAndPrivateNotes["stages"][number];
    grantName: string;
    builderAddress: string;
    isGrant?: boolean;
    grantNumber: number;
  }
>(({ stage, grantName, builderAddress, isGrant, grantNumber }, ref) => {
  const { reviewStage, isSigning, isPostingStageReview } = useStageReview(stage.id);
  const isFinalApproveButtonLoading = isPostingStageReview || isSigning;
  const { approvalVotes } = stage;
  const [isAmountValidationEnabled, setIsAmountValidationEnabled] = useState(false);
  const enableAmountValidation = () => {
    if (!isAmountValidationEnabled) {
      setIsAmountValidationEnabled(true);
    }
  };

  const { getCommonOptions, formMethods } = useFormMethods<FinalApproveModalFormValues>({
    schema: finalApproveModalFormSchema,
  });

  const { handleSubmit, getValues, setValue, trigger } = formMethods;

  const { writeContractAsync, isPending: isWriteContractPending } = useScaffoldWriteContract("Stream");

  // we could write more robust logic to handle some edge cases. Being optimistic for now and assuming grantNumbers will be linear
  const { data: contractGrantIdForBuilder } = useScaffoldReadContract({
    contractName: "Stream",
    functionName: "builderGrants",
    args: [builderAddress, BigInt(grantNumber - 1)],
    query: {
      enabled: !isGrant,
    },
  });

  const handleSetupStream = async () => {
    enableAmountValidation();

    try {
      const fieldValues = getValues();
      const isGrantAmountValid = await trigger("grantAmount", { shouldFocus: true });
      if (!isGrantAmountValid) {
        return;
      }

      let txHash;

      if (isGrant) {
        txHash = await writeContractAsync({
          functionName: "addGrantStream",
          args: [builderAddress, parseEther(fieldValues.grantAmount), grantNumber],
        });
      } else {
        if (!contractGrantIdForBuilder)
          return notification.error("Error getting grant for corresponding builder in contract");
        txHash = await writeContractAsync({
          functionName: "moveGrantToNextStage",
          args: [contractGrantIdForBuilder, parseEther(fieldValues.grantAmount)],
        });
      }

      if (txHash) {
        setValue("txHash", txHash, { shouldValidate: false });
      }
    } catch (e) {
      console.error("Error sending setup transaction", e);
    }
  };

  const onSubmit = async (fieldValues: FinalApproveModalFormValues) => {
    await reviewStage({ status: "approved", ...fieldValues, grantNumber: grantNumber.toString() });
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
          <button className="btn btn-sm btn-circle btn-ghost text-xl h-auto">✕</button>
        </form>
        <FormProvider {...formMethods}>
          {approvalVotes.length > 0 && (
            <>
              <div className="font-bold">Pre-approved by:</div>

              {approvalVotes.map(approvalVote => (
                <div key={approvalVote.id} className="flex items-center gap-2">
                  <Address address={approvalVote.authorAddress} />
                  <span>({formatEther(approvalVote.amount)} ETH suggested)</span>
                </div>
              ))}
              <div className="divider" />
            </>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-1">
            <FormInput
              label={`Grant amount for stage ${stage.stageNumber} (in ETH)`}
              {...getCommonOptions("grantAmount")}
              onChange={async e => {
                if (isAmountValidationEnabled) {
                  setValue("grantAmount", e.target.value, { shouldValidate: true });
                }
              }}
            />
            <FormTextarea label="Note (visible to grantee)" {...getCommonOptions("statusNote")} />
            <FormInput label="Tx hash" {...getCommonOptions("txHash")} />
            <div className="grid grid-cols-2 gap-2 mt-4 items-center justify-center">
              <Button
                variant="green-secondary"
                disabled={isWriteContractPending || isFinalApproveButtonLoading}
                onClick={handleSetupStream}
                className="!px-4"
                type="button"
              >
                {isWriteContractPending && <span className="loading loading-spinner" />}
                <span>Setup stream</span>
              </Button>
              <Button
                variant="green"
                type="submit"
                className="!px-4"
                disabled={isWriteContractPending || isFinalApproveButtonLoading}
                onClick={enableAmountValidation}
              >
                {isFinalApproveButtonLoading && <span className="loading loading-spinner" />}
                <span>Final Approve</span>
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
      <Toaster />
    </dialog>
  );
});

FinalApproveModal.displayName = "FinalApproveModal";
