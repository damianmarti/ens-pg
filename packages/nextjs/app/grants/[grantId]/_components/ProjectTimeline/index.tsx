"use client";

import { TimelineStage } from "./TimelineStage";
import { Grant } from "~~/services/database/repositories/grants";
import { Stage } from "~~/services/database/repositories/stages";

type ProjectTimelineProps = { stages: Stage[]; grant: Grant };

export type MockStage = Pick<Stage, "stageNumber">;

const MIN_STAGES = 4;

export const ProjectTimeline = ({ stages, grant }: ProjectTimelineProps) => {
  const hasMockStages = stages.length < MIN_STAGES;
  const mockStages: MockStage[] = hasMockStages
    ? new Array(MIN_STAGES - stages.length).fill(null).map((_, idx) => ({
        stageNumber: stages.length + 1 + idx,
      }))
    : [];

  const reversedStages = [...[...stages].reverse(), ...mockStages];

  return (
    <div className="w-full max-w-5xl">
      <span className="text-2xl font-bold">Project timeline</span>

      <div className="bg-white pl-8 pr-4 sm:px-12 py-4 sm:py-10 mt-6 flex flex-col rounded-xl">
        {reversedStages.map(stage => (
          <TimelineStage key={stage.stageNumber} stage={stage} grant={grant} />
        ))}
      </div>
    </div>
  );
};
