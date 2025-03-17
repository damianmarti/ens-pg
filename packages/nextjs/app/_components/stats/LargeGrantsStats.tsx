import { StatsItem } from "./StatsItem";
import { getPublicLargeGrants } from "~~/services/database/repositories/large-grants";

export const LargeGrantsStats = async () => {
  const allLargeGrants = await getPublicLargeGrants();
  const largeGrants = allLargeGrants.filter(grant => {
    const latestStage = grant.stages[0];
    return (
      (latestStage.status !== "proposed" && latestStage.status !== "rejected" && latestStage.stageNumber === 1) ||
      latestStage.stageNumber !== 1
    );
  });

  const usdcGranted = largeGrants
    .flatMap(grant => grant.stages)
    .flatMap(stage => stage.milestones)
    .filter(milestone => milestone.status === "completed")
    .map(milestone => milestone.amount ?? 0)
    .reduce((total, amount) => total + amount, 0);

  return (
    <div className="inline-flex justify-center items-center gap-2 bg-white rounded-lg overflow-hidden">
      <StatsItem value={usdcGranted} description="USDC granted" large />
      <div className="flex flex-col gap-1">
        <StatsItem value={largeGrants.length} description="Large Grants" large secondary />
        <StatsItem value={allLargeGrants.length} description="Proposals" large secondary />
      </div>
    </div>
  );
};
