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

const LOADING_STATUS_MAP = {
  CreatingStream: "Creating grant stream",
  Approving: "Approving grant",
  MovingToNextStage: "Moving grant to next stage",
  Empty: "",
} as const;

const WAITING_FOR_SIGNATURE_POSTFIX = "waiting for signature";

type LoadingStatus = (typeof LOADING_STATUS_MAP)[keyof typeof LOADING_STATUS_MAP];

const getLoadingStatusText = ({ status, isWaiting }: { status: LoadingStatus; isWaiting: boolean }) => {
  if (status === LOADING_STATUS_MAP.Empty) {
    return status;
  }

  if (isWaiting) {
    return `${status}, ${WAITING_FOR_SIGNATURE_POSTFIX}...`;
  }

  return `${status}...`;
};

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
  const { reviewStage, isSigning } = useStageReview(stage.id);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(LOADING_STATUS_MAP.Empty);
  const { approvalVotes } = stage;

  const { getCommonOptions, formMethods } = useFormMethods<FinalApproveModalFormValues>({
    schema: finalApproveModalFormSchema,
  });

  const { handleSubmit } = formMethods;

  const { writeContractAsync, isPending: isWriteContractPending } = useScaffoldWriteContract("Stream");

  const { data: contractGrantIdForBuilder } = useScaffoldReadContract({
    contractName: "Stream",
    functionName: "getGrantIdByBuilderAndGrantNumber",
    // @ts-expect-error: grantNumber is safe to convert to BigInt
    args: [builderAddress, BigInt(grantNumber)],
    query: {
      enabled: !isGrant,
    },
  });

  const handleSetupStream = async (fieldValues: FinalApproveModalFormValues) => {
    try {
      let txHash;

      if (isGrant) {
        setLoadingStatus(LOADING_STATUS_MAP.CreatingStream);
        txHash = await writeContractAsync({
          functionName: "addGrantStream",
          args: [builderAddress, parseEther(fieldValues.grantAmount), grantNumber],
        });
      } else {
        if (!contractGrantIdForBuilder) {
          setLoadingStatus(LOADING_STATUS_MAP.Empty);

          return notification.error("Error getting grant for corresponding builder in contract");
        }
        setLoadingStatus(LOADING_STATUS_MAP.MovingToNextStage);

        txHash = await writeContractAsync({
          functionName: "moveGrantToNextStage",
          args: [contractGrantIdForBuilder, parseEther(fieldValues.grantAmount)],
        });
      }

      return txHash;
    } catch (e) {
      console.error("Error sending setup transaction", e);
    }
  };

  const onSubmit = async (fieldValues: FinalApproveModalFormValues) => {
    const txHash = await handleSetupStream(fieldValues);
    if (!txHash) {
      setLoadingStatus(LOADING_STATUS_MAP.Empty);
      return notification.error("Error setting up stream");
    }
    setLoadingStatus(LOADING_STATUS_MAP.Approving);
    await reviewStage({ status: "approved", ...fieldValues, txHash, grantNumber: grantNumber.toString() });
    setLoadingStatus(LOADING_STATUS_MAP.Empty);
  };

  const loadingStatusText = getLoadingStatusText({
    status: loadingStatus,
    isWaiting: isSigning || isWriteContractPending,
  });

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
            />
            <FormTextarea label="Note (visible to grantee)" {...getCommonOptions("statusNote")} />
            {loadingStatusText && (
              <div className="text-xl flex justify-center items-center gap-2 my-2">
                <span className="loading loading-spinner" />
                {loadingStatusText}
              </div>
            )}
            <Button variant="green" type="submit" className="!px-4 self-center" disabled={Boolean(loadingStatus)}>
              <span>Final Approve</span>
            </Button>
          </form>
        </FormProvider>
      </div>
      <Toaster />
    </dialog>
  );
});

FinalApproveModal.displayName = "FinalApproveModal";
