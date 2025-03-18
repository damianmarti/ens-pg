"use client";

import { MilestoneDetail } from "./MilestoneDetail";
import { Badge } from "~~/components/pg-ens/Badge";
import { GrantProgressBar } from "~~/components/pg-ens/GrantProgressBar";
import { LargeStageWithMilestones } from "~~/services/database/repositories/large-stages";

export const CurrentStage = ({ stage }: { stage: LargeStageWithMilestones }) => {
  const allMilestonesGrantAmount = stage.milestones.reduce((acc, current) => acc + current.amount, 0);

  const completedMilestones = stage.milestones.filter(milestone => milestone.status === "paid");
  const completedMilestonesAmount = completedMilestones.reduce((acc, current) => acc + current.amount, 0);

  return (
    <div className="w-full max-w-5xl">
      <div className="flex gap-8">
        <span className="text-2xl font-bold">Stage {stage.stageNumber}</span>
        <Badge status={stage.status} />
      </div>
      {(stage.status === "approved" || stage.status === "completed") && (
        <div className="bg-white px-4 sm:px-8 py-4 mt-6 rounded-xl">
          <div className="text-xl font-bold">Milestones Progress</div>

          <GrantProgressBar
            className="w-full mt-8"
            isLargeGrant={true}
            amount={allMilestonesGrantAmount}
            withdrawn={completedMilestonesAmount}
          />
        </div>
      )}

      {stage.milestones.map(milestone => (
        <MilestoneDetail milestone={milestone} key={milestone.id} />
      ))}
    </div>
  );
};
