import { forwardRef } from "react";
import { useRouter } from "next/navigation";
import { WithdrawModalFormValues, withdrawModalFormSchema } from "./schema";
import { useMutation } from "@tanstack/react-query";
import { FormProvider } from "react-hook-form";
import { Toaster } from "react-hot-toast";
import { parseEther } from "viem";
import { useSignTypedData } from "wagmi";
import { StageWithdrawReqBody } from "~~/app/api/stages/[stageId]/withdraw/route";
import { Button } from "~~/components/pg-ens/Button";
import { FormInput } from "~~/components/pg-ens/form-fields/FormInput";
import { FormTextarea } from "~~/components/pg-ens/form-fields/FormTextarea";
import { useFormMethods } from "~~/hooks/pg-ens/useFormMethods";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Stage } from "~~/services/database/repositories/stages";
import { EIP_712_DOMAIN, EIP_712_TYPES__WITHDRAW_FROM_STAGE } from "~~/utils/eip712";
import { postMutationFetcher } from "~~/utils/react-query";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

type WithdrawModalProps = { stage: Stage; closeModal: () => void; contractGrantId?: bigint };

export const WithdrawModal = forwardRef<HTMLDialogElement, WithdrawModalProps>(
  ({ stage, closeModal, contractGrantId }, ref) => {
    const router = useRouter();

    const { formMethods, getCommonOptions } = useFormMethods<WithdrawModalFormValues>({
      schema: withdrawModalFormSchema,
    });
    const { handleSubmit, reset: clearFormValues } = formMethods;

    const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();

    const { mutateAsync: postWithdraw, isPending: isPostingWithdraw } = useMutation({
      mutationFn: (stageWithdrawBody: StageWithdrawReqBody) =>
        postMutationFetcher(`/api/stages/${stage.id}/withdraw`, { body: stageWithdrawBody }),
    });

    const { writeContractAsync, isPending: isWritingWithOnChain } = useScaffoldWriteContract("Stream");

    const onSubmit = async (fieldValues: WithdrawModalFormValues) => {
      let txnHash: string | undefined;
      try {
        const { completedMilestones, withdrawAmount } = fieldValues;

        txnHash = await writeContractAsync({
          functionName: "streamWithdraw",
          args: [contractGrantId, parseEther(withdrawAmount), completedMilestones],
        });

        const signature = await signTypedDataAsync({
          domain: EIP_712_DOMAIN,
          types: EIP_712_TYPES__WITHDRAW_FROM_STAGE,
          primaryType: "Message",
          message: {
            completedMilestones,
            withdrawAmount,
            stageId: String(stage.id),
          },
        });

        await postWithdraw({ signature, completedMilestones, withdrawAmount });
        closeModal();
        clearFormValues();
        router.refresh();
      } catch (error) {
        if (!txnHash) {
          // error was from writeContractAsync and already handled
          return;
        }
        const errorMessage = getParsedError(error);
        notification.error(errorMessage);
      }
    };

    return (
      <dialog id="action_modal" className="modal" ref={ref}>
        <div className="modal-box flex flex-col space-y-3">
          <form method="dialog" className="bg-secondary -mx-6 -mt-6 px-6 py-4 flex items-center justify-between">
            <div className="flex justify-between items-center">
              <p className="font-bold text-xl m-0">Withdraw a milestone</p>
            </div>
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost text-xl h-auto">✕</button>
          </form>
          <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col space-y-1">
              <FormInput label="Amount (in ETH)" {...getCommonOptions("withdrawAmount")} />
              <FormTextarea
                label="Completed Milestone and proof of completion"
                showMessageLength
                {...getCommonOptions("completedMilestones")}
              />
              <Button
                type="submit"
                disabled={isPostingWithdraw || isSigning || isWritingWithOnChain}
                className="self-center"
              >
                {(isPostingWithdraw || isSigning || isWritingWithOnChain) && (
                  <span className="loading loading-spinner"></span>
                )}
                Withdraw
              </Button>
            </form>
          </FormProvider>
        </div>
        <Toaster />
      </dialog>
    );
  },
);

WithdrawModal.displayName = "WithdrawModal";
