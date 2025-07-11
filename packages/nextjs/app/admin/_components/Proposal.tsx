"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ApprovalVoteModal } from "./ApprovalVoteModal";
import { ExportGrantMarkdown } from "./ExportGrantMarkdown";
import { FinalApproveModal } from "./FinalApproveModal";
import { PrivateNoteModal } from "./PrivateNoteModal";
import { RejectModal } from "./RejectModal";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "~~/components/pg-ens/Button";
import { FormErrorMessage } from "~~/components/pg-ens/form-fields/FormErrorMessage";
import { Address } from "~~/components/scaffold-eth";
import { getAllGrantsWithStagesAndPrivateNotes } from "~~/services/database/repositories/grants";
import { MINIMAL_VOTES_FOR_FINAL_APPROVAL } from "~~/utils/approval-votes";
import { getFormattedDate } from "~~/utils/getFormattedDate";
import { multilineStringToTsx } from "~~/utils/multiline-string-to-tsx";

function isElementClamped(element: HTMLElement | null) {
  if (!element) return false;
  return element.scrollHeight > element.clientHeight;
}

export type GrantWithStagesAndPrivateNotes = Awaited<ReturnType<typeof getAllGrantsWithStagesAndPrivateNotes>>[0];

type ProposalProps = {
  proposal: GrantWithStagesAndPrivateNotes;
  userSubmissionsAmount: number;
  isGrant?: boolean;
};

export const Proposal = ({ proposal, userSubmissionsAmount, isGrant }: ProposalProps) => {
  const milesonesRef = useRef<HTMLDivElement>(null);
  const [isDefaultExpanded, setIsDefaultExpanded] = useState(true);
  const [isExpandedByClick, setIsExpandedByClick] = useState(false);
  const [canReject, setCanReject] = useState(true);
  const { address } = useAccount();

  const privateNoteModalRef = useRef<HTMLDialogElement>(null);
  const finalApproveModalRef = useRef<HTMLDialogElement>(null);
  const approvalVoteModalRef = useRef<HTMLDialogElement>(null);
  const rejectModalRef = useRef<HTMLDialogElement>(null);

  const latestStage = proposal.stages[0];
  const { privateNotes, approvalVotes, rejectVotes } = latestStage;
  const canVote = !approvalVotes || approvalVotes.every(vote => vote.authorAddress !== address);

  const isFinalApproveAvailable = approvalVotes && approvalVotes.length + 1 >= MINIMAL_VOTES_FOR_FINAL_APPROVAL;
  const isFinalRejectAvailable = rejectVotes && rejectVotes.length + 1 >= MINIMAL_VOTES_FOR_FINAL_APPROVAL;

  const milestonesToShow = latestStage.stageNumber > 1 ? latestStage.milestone : proposal.milestones;

  const [showMarkdown, setShowMarkdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const markdown = ExportGrantMarkdown({ grant: proposal });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      alert("Failed to copy!");
    }
  };

  useEffect(() => {
    setCanReject(!rejectVotes || rejectVotes.every(vote => vote.authorAddress !== address));
  }, [rejectVotes, address]);

  useEffect(() => {
    // waits for render to calculate
    setIsDefaultExpanded(!isElementClamped(milesonesRef.current));
  }, []);

  return (
    <div className="card bg-white text-primary-content w-full max-w-lg shadow-center">
      <div className="px-5 py-3 flex justify-between items-center w-full">
        <div className="font-bold text-xl flex items-center">
          <div className="rounded-full bg-medium-purple h-3.5 w-3.5 min-w-3.5 mr-2" />
          Stage {latestStage.stageNumber}
        </div>
        <div>{getFormattedDate(latestStage.submitedAt as Date)}</div>
      </div>
      <div className="px-5 py-8 bg-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold mb-0">{proposal.title}</h2>
          <button
            type="button"
            className="ml-2 p-1 rounded hover:bg-gray-200"
            onClick={() => setShowMarkdown(true)}
            title="Export to Markdown"
          >
            <ClipboardIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <Link
          href={`/grants/${proposal.id}`}
          className="text-gray-500 underline flex items-center gap-1"
          target="_blank"
        >
          View grant <ArrowTopRightOnSquareIcon className="w-5 h-5" />
        </Link>
        <div className="mt-6 flex flex-col lg:flex-row gap-1">
          <Address address={proposal.builderAddress} />
          {latestStage.stageNumber === 1 && (
            <>
              <span className="hidden lg:inline">·</span>
              <Link
                href={`/builder-grants/${proposal.builderAddress}`}
                className="text-gray-500 underline flex items-center gap-1"
                target="_blank"
              >
                <span>
                  {userSubmissionsAmount} submission{userSubmissionsAmount === 1 ? "" : "s"}
                </span>
                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
              </Link>
            </>
          )}
        </div>
        {(approvalVotes.length > 0 || rejectVotes.length > 0) && (
          <div className="flex gap-1 justify-end">
            {approvalVotes.map(vote => (
              <div
                key={vote.id}
                className="tooltip lg:tooltip-top tooltip-left"
                data-tip={`Pre-approved by ${vote.authorAddress}`}
              >
                <div>👍</div>
              </div>
            ))}
            {rejectVotes.map(vote => (
              <div
                key={vote.id}
                className="tooltip lg:tooltip-top tooltip-left"
                data-tip={`Pre-rejected by ${vote.authorAddress}`}
              >
                <div>👎</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="inline-block px-2 font-semibold bg-gray-100 rounded-sm">
          Initial grant request: {formatEther(proposal.requestedFunds)} ETH
        </div>

        <div className="mt-2">
          <div className="font-semibold">
            {latestStage.stageNumber > 1 ? "Stage milestones:" : "Planned milestones:"}
          </div>
          <div className={isExpandedByClick ? "" : "line-clamp-4"} ref={milesonesRef}>
            {milestonesToShow ? multilineStringToTsx(milestonesToShow) : "-"}
          </div>
          {!isDefaultExpanded && !isExpandedByClick && milestonesToShow && (
            <button className="bg-transparent font-semibold underline" onClick={() => setIsExpandedByClick(true)}>
              Read more
            </button>
          )}
        </div>

        <div className="flex flex-col 2xl:flex-row-reverse 2xl:items-start justify-between gap-3 mt-4">
          <div className="flex flex-col 2xl:flex-row 2xl:items-start gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => privateNoteModalRef && privateNoteModalRef.current?.showModal()}
            >
              Set private note
            </Button>

            {isFinalApproveAvailable ? (
              <div className="flex flex-col gap-1">
                <Button
                  variant="green"
                  size="sm"
                  onClick={() => finalApproveModalRef && finalApproveModalRef.current?.showModal()}
                  disabled={!canVote}
                >
                  Final Approve
                </Button>
                {!canVote && <FormErrorMessage error="Voted" className="text-center" />}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <Button
                  variant="green-secondary"
                  size="sm"
                  onClick={() => approvalVoteModalRef && approvalVoteModalRef.current?.showModal()}
                  disabled={!canVote}
                >
                  Vote for approval
                </Button>
                {!canVote && <FormErrorMessage error="Voted" className="text-center" />}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Button
              variant={isFinalRejectAvailable ? "red" : "red-secondary"}
              size="sm"
              onClick={() => rejectModalRef && rejectModalRef.current?.showModal()}
              disabled={!canReject}
            >
              Reject
            </Button>
            {!canReject && <FormErrorMessage error="Voted" className="text-center" />}
          </div>
        </div>

        {privateNotes?.length > 0 && (
          <div className="mt-5 pt-3 border-t border-gray-200">
            {privateNotes.map(privateNote => (
              <div key={privateNote.id} className="mt-1 first:mt-0 text-gray-400">
                <div className="flex gap-1">
                  <Address address={privateNote.authorAddress as `0x${string}`} /> :
                </div>
                <div className="ml-[30px]">{multilineStringToTsx(privateNote.note)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FinalApproveModal
        ref={finalApproveModalRef}
        stage={proposal.stages[0]}
        builderAddress={proposal.builderAddress}
        grantName={proposal.title}
        isGrant={isGrant}
        grantNumber={proposal.grantNumber}
      />
      <ApprovalVoteModal
        ref={approvalVoteModalRef}
        stage={latestStage}
        grantName={proposal.title}
        closeModal={() => approvalVoteModalRef.current?.close()}
      />
      <RejectModal
        ref={rejectModalRef}
        stage={latestStage}
        grantName={proposal.title}
        closeModal={() => rejectModalRef.current?.close()}
      />
      <PrivateNoteModal
        ref={privateNoteModalRef}
        stage={latestStage}
        grantName={proposal.title}
        closeModal={() => privateNoteModalRef.current?.close()}
      />

      {showMarkdown && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Exported Markdown</h2>
            <textarea className="w-full h-64 p-2 border rounded mb-4" value={markdown} readOnly />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowMarkdown(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
