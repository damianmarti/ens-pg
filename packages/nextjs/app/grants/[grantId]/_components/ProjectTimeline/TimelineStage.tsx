import { MockStage } from ".";
import { TimelineCompleteButton } from "./TimelineCompleteButton";
import { formatEther } from "viem";
import { MagnifyingGlassIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import { StyledTooltip } from "~~/components/pg-ens/StyledTooltip";
import { Stage } from "~~/services/database/repositories/stages";
import { Withdrawal } from "~~/services/database/repositories/withdrawals";
import { getFormattedDate } from "~~/utils/getFormattedDate";
import { multilineStringToTsx } from "~~/utils/multiline-string-to-tsx";

type TimelineStageProps = { stage: (Stage & { withdrawals: Withdrawal[] }) | MockStage };

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
            <div className={`flex flex-col font-bold text-2xl mt-1`}>
              <div className={`flex gap-1 items-center ${isOdd ? "" : "sm:flex-row-reverse"}`}>
                <span>
                  Stage {stage.stageNumber} {stage.status}
                </span>
                {stage.statusNote && (
                  <>
                    <span data-tooltip-id={`tooltip-note-${stage.stageNumber}`} className="">
                      <QuestionMarkCircleIcon className="h-7 w-7 text-gray-400" />
                    </span>
                    <StyledTooltip id={`tooltip-note-${stage.stageNumber}`}>
                      {multilineStringToTsx(stage.statusNote)}
                    </StyledTooltip>
                  </>
                )}

                {stage.milestone && (
                  <>
                    <span data-tooltip-id={`tooltip-milestone-${stage.stageNumber}`} className="ml-2">
                      <MagnifyingGlassIcon className="h-7 w-7 text-gray-400" />
                    </span>
                    <StyledTooltip id={`tooltip-milestone-${stage.stageNumber}`}>
                      {multilineStringToTsx(stage.milestone)}
                    </StyledTooltip>
                  </>
                )}
              </div>

              {stage.grantAmount ? <span>Grant: {formatEther(stage.grantAmount)} ETH</span> : null}
            </div>

            {stage.withdrawals.map((withdrawal, idx) => (
              <div key={`withdrawal-${withdrawal.id}`} className="mt-3 text-gray-500">
                <div className="font-bold text-lg">
                  Milestone {idx + 1} ({formatEther(withdrawal.withdrawAmount as bigint)} Eth withdraw)
                </div>

                {multilineStringToTsx(withdrawal.milestones || "-")}
              </div>
            ))}
            {stage.status === "approved" && <TimelineCompleteButton stage={stage} />}
          </>
        ) : (
          <div className="font-bold text-2xl -mt-1.5 text-gray-500">Stage {stage.stageNumber} (locked)</div>
        )}
      </div>
    </div>
  );
};
