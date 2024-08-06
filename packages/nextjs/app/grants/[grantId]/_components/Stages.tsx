"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { NewStageModal } from "./NewStageModal";
import { useStageReview } from "~~/hooks/pg-ens/useStageReview";
import { Grant } from "~~/services/database/repositories/grants";
import { Stage } from "~~/services/database/repositories/stages";

export const Stages = ({ stages, grantId }: { stages: Stage[]; grantId: Grant["id"] }) => {
  const latestStage = stages[0];
  const reversedStages = [...stages].reverse();

  const newStageModalRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  const { reviewStage, isSigning, isPostingStageReview } = useStageReview(latestStage.id);

  if (!stages || stages.length === 0) {
    return <h1 className="text-2xl">No stages found</h1>;
  }

  return (
    <>
      {reversedStages.map(stage => (
        <div key={stage.id} className="card bg-primary text-primary-content w-full max-w-96">
          <div className="card-body">
            <h2 className="card-title p-0">Stage {stage.stageNumber}</h2>
            {stage.status === "approved" && (
              <button
                className="btn btn-success btn-sm"
                disabled={isPostingStageReview || isSigning}
                onClick={async () => {
                  await reviewStage({ status: "completed" });
                  router.refresh();
                }}
              >
                {isPostingStageReview || (isSigning && <span className="loading loading-spinner"></span>)}
                Complete
              </button>
            )}
            <p className="p-0 m-1">Current Status: {stage.status}</p>
          </div>
        </div>
      ))}
      {latestStage.status === "completed" && (
        <button className="btn btn-primary" onClick={() => newStageModalRef && newStageModalRef.current?.showModal()}>
          Apply for new stage
        </button>
      )}
      <NewStageModal
        ref={newStageModalRef}
        previousStage={latestStage}
        grantId={grantId}
        closeModal={() => newStageModalRef && newStageModalRef.current?.close()}
      />
    </>
  );
};
