"use client";

import { LargeGrantWithStages } from "../../page";
import { TimelineFakeStage } from "./TimelineFakeStage";
import { TimelineStage } from "./TimelineStage";

const MIN_STAGES = 4;

export const ProjectTimeline = ({ grant }: { grant: LargeGrantWithStages }) => {
  if (!grant) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl">
      <span className="text-2xl font-bold">Project timeline</span>

      <div className="bg-white pl-8 pr-4 sm:px-12 py-4 sm:py-10 mt-6 flex flex-col rounded-xl">
        {grant.stages.map(stage => (
          <TimelineStage key={stage.stageNumber} stage={stage} />
        ))}
        {(() => {
          const elements = [];
          for (let i = grant.stages.length; i < MIN_STAGES; i++) {
            elements.push(<TimelineFakeStage key={i + 1} stageNumber={i + 1} />);
          }
          return elements;
        })()}
      </div>
    </div>
  );
};
