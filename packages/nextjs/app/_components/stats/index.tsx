import { StatsItem } from "./StatsItem";
import { formatEther } from "viem";
import { getAllGrants } from "~~/services/database/repositories/grants";

export const Stats = async () => {
  const allGrants = await getAllGrants();
  const grants = allGrants.filter(grant => {
    const latestStage = grant.stages[0];
    return (
      (latestStage.status !== "proposed" && latestStage.status !== "rejected" && latestStage.stageNumber === 1) ||
      latestStage.stageNumber !== 1
    );
  });

  const ethGranted = grants
    .flatMap(grant => grant.stages)
    .map(stage => stage.grantAmount)
    .filter(grantAmount => grantAmount)
    .reduce((a, b) => (a as bigint) + (b as bigint), 0n);

  return (
    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-6">
      <StatsItem value={Number(formatEther(ethGranted as bigint))} description="ETH granted" />
      <StatsItem value={grants.length} description="Grants" />
      <StatsItem value={allGrants.length} description="Proposals" />
    </div>
  );
};
