"use client";

import Link from "next/link";
import { BuilderGrantsResponse } from "../api/builders/[builderAddress]/grants/route";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
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
          <div key={grant.id} className="card bg-primary text-primary-content w-96">
            <div className="card-body">
              <h2 className="card-title p-0">{grant.title}</h2>
              <p className="p-0 m-1">{grant.description}</p>
              <p className="p-0 m-1">Current status: {latestStage.status}</p>
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
