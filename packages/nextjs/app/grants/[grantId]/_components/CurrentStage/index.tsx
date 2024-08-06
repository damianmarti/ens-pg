"use client";

import { useRef } from "react";
import { GrantWithStages } from "../../page";
import { NewStageModal } from "./NewStageModal";
import { Badge } from "~~/components/pg-ens/Badge";
import { Button } from "~~/components/pg-ens/Button";
import { GrantProgressBar } from "~~/components/pg-ens/GrantProgressBar";

type CurrentStageProps = {
  grant: NonNullable<GrantWithStages>;
};

export const CurrentStage = ({ grant }: CurrentStageProps) => {
  const latestStage = grant.stages[0];

  const newStageModalRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="w-full max-w-5xl">
      <div className="flex gap-8">
        <span className="text-2xl font-bold">Stage {latestStage.stageNumber}</span>
        <Badge status={latestStage.status} />
      </div>
      <div className="bg-white px-4 sm:px-12 py-4 sm:py-10 mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center rounded-xl">
        {latestStage.status === "completed" ? (
          <Button onClick={() => newStageModalRef && newStageModalRef.current?.showModal()}>Apply for new stage</Button>
        ) : (
          <Button onClick={() => console.log("withdraw milestone")}>Withdraw milestone</Button>
        )}

        <GrantProgressBar className="w-full sm:w-1/2" amount={2} withdrawn={1.5} available={0.2} />
      </div>

      <NewStageModal
        ref={newStageModalRef}
        previousStage={latestStage}
        grantId={grant.id}
        closeModal={() => newStageModalRef && newStageModalRef.current?.close()}
      />
    </div>
  );
};
