import { MockStage } from ".";
import { TimelineCompleteButton } from "./TimelineCompleteButton";
import { formatEther } from "viem";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import { StyledTooltip } from "~~/components/pg-ens/StyledTooltip";
import { Stage } from "~~/services/database/repositories/stages";
import { multilineStringToTsx } from "~~/utils/multiline-string-to-tsx";

function getFormattedDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

type TimelineStageProps = { stage: Stage | MockStage };

export const TimelineStage = ({ stage }: TimelineStageProps) => {
  const isOdd = stage.stageNumber % 2;

  const isRealStage = "id" in stage;

  return (
    <div className="grid sm:grid-cols-2">
      <div
        className={`hidden sm:block border-primary ${
          isRealStage ? "border-primary" : "border-secondary border-dashed"
        } ${isOdd ? "order-1 border-r-2" : "order-3 border-l-2"}`}
      />
      <div
        className={`relative px-8 pb-4 pt-1 order-2 ${
          isRealStage ? "border-primary" : "border-secondary border-dashed"
        }  min-h-36 ${isOdd ? "border-l-2" : "border-l-2 sm:border-l-0 sm:border-r-2 sm:text-right"}`}
      >
        <CheckCircleSolidIcon
          className={`absolute bg-white ${isRealStage ? "text-primary" : "text-secondary"} h-8 w-8 top-0 ${
            isOdd ? "-left-[18px]" : "-left-[18px] sm:left-auto sm:-right-[18px]"
          }`}
        />
        {isRealStage ? (
          <>
            {stage.submitedAt && <div>{getFormattedDate(stage.submitedAt)}</div>}
            <div className={`font-bold text-2xl mt-1 flex items-center ${isOdd ? "" : "sm:justify-end"}`}>
              <span>
                Stage {stage.stageNumber} {stage.status}: {formatEther(stage.grantAmount || 0n)} ETH grant
              </span>
              {stage.statusNote && (
                <>
                  <span data-tooltip-id={`tooltip-${stage.stageNumber}`} className="ml-2">
                    <QuestionMarkCircleIcon className="h-7 w-7 text-gray-400" />
                  </span>
                  <StyledTooltip id={`tooltip-${stage.stageNumber}`}>
                    {multilineStringToTsx(stage.statusNote)}
                  </StyledTooltip>
                </>
              )}
            </div>
            {stage.milestone && (
              <div className="mt-3 text-gray-500">
                <div className="font-bold text-lg">Planned Milestones:</div>
                {/* TODO: stage milestones */}
                {multilineStringToTsx(stage.milestone)}
              </div>
            )}
            {stage.status === "approved" && <TimelineCompleteButton stage={stage} />}
          </>
        ) : (
          <div className="font-bold text-2xl -mt-1.5 text-gray-500">Stage {stage.stageNumber} (locked)</div>
        )}
      </div>
    </div>
  );
};
