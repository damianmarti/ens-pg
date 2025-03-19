import { StatsItem } from "./StatsItem";
import { getLargeGrantsStats } from "~~/services/database/repositories/large-grants";

export const LargeGrantsStats = async () => {
  const { totalUsdcGranted, allGrantsCount, proposedLargeGrantsCount } = await getLargeGrantsStats();

  return (
    <div className="inline-flex justify-center items-center gap-2 bg-white rounded-lg overflow-hidden">
      <StatsItem value={totalUsdcGranted} description="USDC granted" large />
      <div className="flex flex-col gap-1">
        <StatsItem value={allGrantsCount} description="Large Grants" large secondary />
        <StatsItem value={proposedLargeGrantsCount} description="Proposals" large secondary />
      </div>
    </div>
  );
};
