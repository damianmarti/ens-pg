"use client";

import { useRef } from "react";
import { CompleteMilestoneModal } from "./CompleteMilestoneModal";
import { BadgeMilestone } from "~~/components/pg-ens/BadgeMilestone";
import { Button } from "~~/components/pg-ens/Button";
import { LargeMilestone } from "~~/services/database/repositories/large-milestones";
import { getFormattedDate } from "~~/utils/getFormattedDate";
import { multilineStringToTsx } from "~~/utils/multiline-string-to-tsx";

export const MilestoneDetail = ({ milestone }: { milestone: LargeMilestone }) => {
  const completeMilestoneModalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <div className="bg-secondary px-4 sm:px-8 py-4 mt-6 flex flex-col gap-4 rounded-xl">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xl font-bold">Milestone {milestone.milestoneNumber}</div>
            <div className="text-sm font-bold">Deadline: {getFormattedDate(milestone.proposedCompletionDate)}</div>
          </div>
          <div className="bg-white rounded-lg p-1 font-bold">{milestone.amount} USDC</div>
        </div>
        <div className="flex flex-col gap-4">
          <div>{multilineStringToTsx(milestone.description)}</div>
          {milestone.status === "approved" ? (
            <Button
              className="w-auto self-start"
              onClick={() => {
                completeMilestoneModalRef.current?.showModal();
              }}
            >
              Complete
            </Button>
          ) : (
            <div className="flex flex-row">
              <BadgeMilestone status={milestone.status} />
              {milestone.status === "paid" && milestone.paidAt && (
                <div className="mt-2 ml-4 text-sm font-bold text-gray-400">
                  Paid on {getFormattedDate(milestone.paidAt)} -
                  <a
                    href={`https://optimistic.etherscan.io/tx/${milestone.paymentTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 underline"
                  >
                    See transaction details
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CompleteMilestoneModal
        ref={completeMilestoneModalRef}
        milestone={milestone}
        closeModal={() => completeMilestoneModalRef.current?.close()}
      />
    </>
  );
};
