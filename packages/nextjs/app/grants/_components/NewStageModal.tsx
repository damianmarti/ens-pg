import { forwardRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAccount, useSignTypedData } from "wagmi";
import { CreateNewStageReqBody } from "~~/app/api/stages/new/route";
import { Grant } from "~~/services/database/repositories/grants";
import { EIP_712_DOMAIN, EIP_712_TYPES__APPLY_FOR_STAGE } from "~~/utils/eip712";
import { postMutationFetcher } from "~~/utils/react-query";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

type NewStageModalProps = {
  grantId: Grant["id"];
  closeModal: () => void;
};

export const NewStageModal = forwardRef<HTMLDialogElement, NewStageModalProps>(({ grantId, closeModal }, ref) => {
  const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();
  const { address: connectedAddress } = useAccount();
  const router = useRouter();

  const { mutateAsync: postNewStage, isPending: isPostingNewStage } = useMutation({
    mutationFn: (newStageBody: CreateNewStageReqBody) => postMutationFetcher("/api/stages/new", { body: newStageBody }),
  });

  const handleFormAction = async (formData: FormData) => {
    try {
      if (!connectedAddress) return notification.error("Please connect your wallet");

      const title = formData.get("title") as string | undefined;
      if (!title) return notification.error("Please fill all the fields");

      const signature = await signTypedDataAsync({
        domain: EIP_712_DOMAIN,
        types: EIP_712_TYPES__APPLY_FOR_STAGE,
        primaryType: "Message",
        message: {
          title: title,
        },
      });

      await postNewStage({ title, signer: connectedAddress, signature, grantId });
      closeModal();
      router.refresh();
    } catch (error) {
      const errorMessage = getParsedError(error);
      notification.error(errorMessage);
    }
  };

  return (
    <dialog id="action_modal" className="modal" ref={ref}>
      <div className="modal-box flex flex-col space-y-3">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <form action={handleFormAction} className="card-body space-y-3">
          <h2 className="card-title self-center text-3xl !mb-0">New Stage</h2>
          <div className="space-y-2">
            <p className="m-0 text-xl ml-2">Title</p>
            <div className="flex border-2 border-base-300 bg-base-200 rounded-xl text-accent">
              <input
                className="input input-ghost focus-within:border-transparent focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
                placeholder="Proposal title"
                name="title"
                autoComplete="off"
                type="text"
                maxLength={75}
              />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={isPostingNewStage || isSigning}>
            {(isPostingNewStage || isSigning) && <span className="loading loading-spinner"></span>}
            APPLY FOR A GRANT
          </button>
        </form>
      </div>
    </dialog>
  );
});

NewStageModal.displayName = "NewStageModal";
