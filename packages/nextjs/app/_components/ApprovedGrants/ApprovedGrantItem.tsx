import { useRef } from "react";
import { GrantMilestonesModal } from "./GrantMilestonesModal";
import { formatEther } from "viem";
import { GrantWithStages } from "~~/app/grants/[grantId]/page";
import { Button } from "~~/components/pg-ens/Button";
import { GrantProgressBar } from "~~/components/pg-ens/GrantProgressBar";
import { Stage } from "~~/services/database/repositories/stages";
import { getFormattedDate } from "~~/utils/getFormattedDate";
import { multilineStringToTsx } from "~~/utils/multiline-string-to-tsx";

type ApprovedGrantItemProps = {
  grant: NonNullable<GrantWithStages>;
};

export const ApprovedGrantItem = ({ grant }: ApprovedGrantItemProps) => {
  const milestonesRef = useRef<HTMLDialogElement>(null);
  const latestApprovedStage = grant.stages.find(
    stage => stage.status === "approved" || stage.status === "completed",
  ) as Stage;
  const allStagesGrantAmount = grant.stages
    .map(stage => stage.grantAmount || 0n)
    .reduce((acc, current) => BigInt(acc || 0n) + BigInt(current || 0n), 0n);

  const allWithdrawals = [...grant.stages].reverse().flatMap(stage => stage.withdrawals);
  const withdrawnFromAllStages = allWithdrawals
    ?.map(withdrawal => withdrawal.withdrawAmount)
    .filter(withdrawAmount => withdrawAmount)
    .reduce((acc, current) => BigInt(acc || 0n) + BigInt(current || 0n), 0n);

  return (
    <div className="card flex flex-col bg-white text-primary-content w-full max-w-96 shadow-center">
      <div className="px-5 py-3 flex justify-between items-center w-full">
        <div className="font-bold text-xl">Stage {latestApprovedStage.stageNumber}</div>
        <div>{getFormattedDate(latestApprovedStage.submitedAt as Date)}</div>
      </div>
      <h2 className="px-5 py-8 text-2xl font-bold bg-gray-100 mb-0">{grant.title}</h2>
      <div className="px-5 py-4 w-full">
        <GrantProgressBar
          className="w-full"
          amount={Number(formatEther(allStagesGrantAmount))}
          withdrawn={Number(formatEther(withdrawnFromAllStages || 0n))}
          // TODO: change to real data
          available={0.01}
        />
      </div>
      <div className="px-5 pb-5 flex flex-col justify-between flex-grow">
        <div className="text-gray-400 line-clamp-4">{multilineStringToTsx(grant.description)}</div>
        {allWithdrawals.length > 0 && (
          <Button
            className="mt-6"
            variant="secondary"
            onClick={() => milestonesRef && milestonesRef.current?.showModal()}
          >
            {allWithdrawals.length} Milestone{allWithdrawals.length > 1 && "s"}
          </Button>
        )}
        <GrantMilestonesModal ref={milestonesRef} withdrawals={allWithdrawals} id={grant.id} />
      </div>
    </div>
  );
};
