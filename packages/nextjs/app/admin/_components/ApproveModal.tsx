import { forwardRef, useRef } from "react";
import { useStageReview } from "../_hooks/useStageReview";
import { Stage } from "~~/services/database/repositories/stages";

export const ApproveModal = forwardRef<HTMLDialogElement, { stage: Stage }>(({ stage }, ref) => {
  const transactionInputRef = useRef<HTMLInputElement>(null);
  const { reviewStage, isSigning, isPostingStageReview } = useStageReview(stage.id);

  return (
    <dialog id="action_modal" className="modal" ref={ref}>
      <div className="modal-box flex flex-col space-y-3">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <div className="flex justify-between items-center">
          <p className="font-bold text-lg m-0">Approve this grant</p>
        </div>
        <div className="w-full flex-col space-y-1">
          <p className="m-0 font-semibold text-base">Transaction Hash</p>
          <input
            type="text"
            ref={transactionInputRef}
            placeholder="Transaction hash"
            className="input input-bordered w-full"
          />
        </div>
        <button
          className="btn btn-md btn-success"
          disabled={isPostingStageReview || isSigning}
          onClick={async () => {
            if (transactionInputRef.current?.value) {
              await reviewStage("approved", transactionInputRef.current.value);
            }
          }}
        >
          {(isPostingStageReview || isSigning) && <span className="loading loading-spinner"></span>}
          Approve
        </button>
      </div>
    </dialog>
  );
});

ApproveModal.displayName = "ApproveModal";
