import { GrantCard } from "./_components/GrantCard";
import type { NextPage } from "next";
import { getAllGrants } from "~~/services/database/repositories/grants";

// TODO: Fix Nextjs caching when navigating to admin page
const Admin: NextPage = async () => {
  const allGrants = await getAllGrants();

  // stage 1 propsed grants
  const proposedGrants = allGrants.filter(grant => {
    const latestStage = grant.stages[0];
    return latestStage?.status === "proposed" && latestStage.stageNumber === 1;
  });

  // grants that have passed stage 1 and are in proposed stage
  const otherGrants = allGrants.filter(grant => {
    const latestStage = grant.stages[0];
    return latestStage?.status === "proposed" && latestStage.stageNumber !== 1;
  });

  return (
    <div className="flex items-center flex-col flex-grow pt-10 space-y-4">
      <h1 className="text-2xl p-0">First time submissions ({proposedGrants.length})</h1>
      {proposedGrants.map(grant => (
        <GrantCard key={grant.id} grant={grant} />
      ))}

      <h1 className="text-2xl p-0">Other stages submission ({otherGrants.length})</h1>
      {otherGrants.map(grant => (
        <GrantCard key={grant.id} grant={grant} />
      ))}
    </div>
  );
};

export default Admin;
