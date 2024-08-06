"use client";

import Link from "next/link";
import { BuilderGrantsResponse } from "../api/builders/[builderAddress]/grants/route";
import { useQuery } from "@tanstack/react-query";
import { Tooltip } from "react-tooltip";
import { useAccount } from "wagmi";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Badge } from "~~/components/pg-ens/Badge";
import { multilineStringToTsx } from "~~/utils/multiline-string-to-tsx";
import { fetcher } from "~~/utils/react-query";

export const MyGrantsList = () => {
  const { address: connectedAddress, isConnected } = useAccount();

  const {
    data: builderGrants,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["grants", { address: connectedAddress }],
    queryFn: () => fetcher<BuilderGrantsResponse>(`/api/builders/${connectedAddress}/grants`),
    enabled: isConnected && connectedAddress !== undefined,
  });

  if (!isConnected) {
    return <h1 className="text-2xl">Connect your wallet</h1>;
  }

  if (isError) {
    return <h1 className="text-2xl">Error loading grants</h1>;
  }

  if (isPending) {
    return <h1 className="text-2xl">Loading...</h1>;
  }

  return (
    <>
      {builderGrants.map(grant => {
        const latestStage = grant.stages[0];
        const showGrantDetailsButton = latestStage.status !== "rejected" || latestStage.stageNumber > 1;
        return (
          <div key={grant.id} className="card bg-white text-primary-content w-96">
            <div className="card-body">
              <div className="flex justify-between items-center w-full mb-2">
                <div className="flex-grow">
                  {latestStage.stageNumber !== 1 && (
                    <p className="px-2 py-3 m-0 badge badge-secondary">Stage {latestStage.stageNumber}</p>
                  )}
                </div>
                <Badge status={latestStage.status} />
                {latestStage.statusNote && (
                  <>
                    <span data-tooltip-id={`tooltip-${grant.id}`} className="ml-2">
                      <QuestionMarkCircleIcon className="h-7 w-7 text-gray-400" />
                    </span>
                    <Tooltip
                      id={`tooltip-${grant.id}`}
                      className="!bg-white !text-[#212638] shadow-lg"
                      classNameArrow="hidden"
                    >
                      {multilineStringToTsx(latestStage.statusNote)}
                    </Tooltip>
                  </>
                )}
              </div>
              <h2 className="card-title p-0">{grant.title}</h2>
              <p className="p-0 m-1">{multilineStringToTsx(grant.description)}</p>
              {showGrantDetailsButton ? (
                <Link href={`/grants/${grant.id}`}>
                  <button className="btn btn-secondary btn-sm">Grant details</button>
                </Link>
              ) : null}
            </div>
          </div>
        );
      })}
    </>
  );
};
