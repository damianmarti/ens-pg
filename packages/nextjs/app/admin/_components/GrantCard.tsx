"use client";

import { useRef } from "react";
import Link from "next/link";
import { useStageReview } from "../_hooks/useStageReview";
import { ApproveModal } from "./ApproveModal";
import { Address } from "~~/components/scaffold-eth";
import { getAllGrants } from "~~/services/database/repositories/grants";

type Grant = Awaited<ReturnType<typeof getAllGrants>>[0];

export const GrantCard = ({ grant }: { grant: Grant }) => {
  const approveModalRef = useRef<HTMLDialogElement>(null);
  const { reviewStage, isSigning, isPostingStageReview } = useStageReview(grant.stages[0].id);
  const latestStage = grant.stages[0];

  return (
    <div className="card bg-primary text-primary-content w-96">
      <div className="card-body">
        <h2 className="card-title p-0">Title: {grant.title}</h2>
        {latestStage.stageNumber === 1 ? (
          <p className="p-0 m-1">{grant.description}</p>
        ) : (
          <p className="p-0 m-1">Stage number: {latestStage.stageNumber}</p>
        )}
        {latestStage.stageNumber !== 1 && (
          <p className="p-0 m-1">
            Planned Milestones for Stage {latestStage.stageNumber}: {latestStage.milestone}
          </p>
        )}
        <Address address={grant.builderAddress} />

        <Link href={`/grants/${grant.id}`}>
          <button className="btn btn-secondary btn-sm">Grant details</button>
        </Link>

        <div className="flex gap-3 mt-2">
          <button
            className="btn btn-success btn-sm"
            onClick={() => approveModalRef && approveModalRef.current?.showModal()}
          >
            Approve
          </button>
          <button
            className="btn btn-error btn-sm"
            onClick={() => reviewStage("rejected")}
            disabled={isPostingStageReview || isSigning}
          >
            Reject
          </button>
        </div>
      </div>
      <ApproveModal ref={approveModalRef} stage={grant.stages[0]} />
    </div>
  );
};
