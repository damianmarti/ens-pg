"use client";

import { GrantWithStages } from "./page";
import { Badge } from "~~/components/pg-ens/Badge";
import { Button } from "~~/components/pg-ens/Button";
import { GrantProgressBar } from "~~/components/pg-ens/GrantProgressBar";

type CurrentStageProps = {
  grant: NonNullable<GrantWithStages>;
};

export const CurrentStage = ({ grant }: CurrentStageProps) => {
  const latestStage = grant.stages[0];

  return (
    <div className="w-full max-w-5xl">
      <div className="flex gap-8">
        <span className="text-2xl font-bold">Stage {latestStage.stageNumber}</span>
        <Badge status={latestStage.status} />
      </div>
      <div className="bg-white px-12 py-10 mt-6 flex justify-between items-center rounded-xl">
        <Button onClick={() => console.log("withdraw milestone")}>Withdraw milestone</Button>
        <GrantProgressBar className="w-1/2" amount={2} withdrawn={1.5} available={0.2} />
      </div>
    </div>
  );
};
